
if(!window.injected)
{
  window.injected = true;
  chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message.cmd === 'whatDestination')
    {
      var activeCount = 0;
      var passwordCount = 0;
      document.querySelectorAll("input[type='password']")
        .forEach(function(t)
        {
          if(t.value !== '') {
            return;
          }
          passwordCount++;
          if(document.activeElement ===  t)
          {
            activeCount++;
          }
        });
      sendResponse({
        activeCount,
        passwordCount,
        web3: {
          isPrivate: Eth.isPrivate(),
          isMetaMask: Eth.isMetaMask(),
          exists: Eth.exists()
        }
      });
      return;
    }
    if(message.cmd === 'sendPassword')
    {
      var activeCount = 0;
      var passwordCount = 0;
      document.querySelectorAll("input[type='password']")
      .forEach(function(t)
      {
        if(t.value !== '') {
          return;
        }
        passwordCount++;
        t.value = message.password;
      });
      if(passwordCount === 0)
      {
        sendResponse({
          error:"There is no empty password field"
        });
      }
      sendResponse({
        success: true
      });
      return;
    }
    if(message.cmd === 'sendTransaction')
    {
      Eth.sendTransaction(message.options, (err, txHash) => {
        if(txHash) {
          sendResponse({
            success: true,
            txHash: txHash
          });
        } else {
          sendResponse({
            error: err
          });
        }
      });
      return true;
    }
    sendResponse({
      error: 'unknown command'
    });
  });

  var exec = function(func, args) {
      var container = document.querySelector('body')
          || document.querySelector('html')
          || document.documentElement;

      if (!container) {
          throw new Error('Failed to execute script because there seems to be no body, html or document at all')
      }
      var str_args = '';
      if(args) {
        str_args = 'JSON.parse(\''+JSON.stringify(args)+'\')';
      }
      var script = document.createElement('script');
      script.innerText = '(' + func.toString() + ')('+str_args+');';
      container.appendChild(script);
  }
  function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  var Eth = {
    sendTransaction: (options, cb) => {
        options.domID = 'pure-pm-chrome-extension-transactionHash-'+makeid();
        exec(function(options) {
          var txHash = document.createElement('div');
          txHash.id = options.domID;
          txHash.style.display = 'none';

          if(!window.web3.isAddress(window.web3.eth.defaultAccount))
          {
            txHash.setAttribute('error', 'no private address');
            document.body.appendChild(txHash);
            return;
          }
          var passwordFormatContract = window.web3.eth.contract(options.contractABI);
          var contractInstance = passwordFormatContract.at(options.contractAddress);
          try {
            contractInstance.addPasswordFormat.sendTransaction(
              options.key,
              options.format,
              {value: options.value},
              function(err, hash) {
                console.error(err, hash);
                if(err) {
                  console.error(err);
                  txHash.setAttribute('error', err);
                  document.body.appendChild(txHash);
                  return;
                }
                txHash.setAttribute('txHash', hash);
                document.body.appendChild(txHash);
              }
            );
          }
          catch(e) {
            txHash.setAttribute('error', e);
            document.body.appendChild(txHash);
          }
        }, options);
        const idInterval = setInterval(function() {
          const dom = document.getElementById(options.domID);
          if(dom) {
            clearInterval(idInterval);
            cb(dom.getAttribute('error'), dom.getAttribute('txHash'))
          }

        }, 100);
    },
    init: () => {
      exec(function() {
        var pageInfo = document.createElement('div');
        pageInfo.id = 'pure-pm-chrome-extension-page-info';
        pageInfo.style.display = 'none';
        if (typeof window.web3 === 'undefined') {
          pageInfo.setAttribute('web3', 'undefined');
        } else {
            if(window.web3.isAddress(window.web3.eth.defaultAccount))
            {
              pageInfo.setAttribute('web3', 'private');
            }
            else
            {
              pageInfo.setAttribute('web3', 'public');
            }

            if(window.web3.currentProvider.isMetaMask)
            {
              pageInfo.setAttribute('currentProvider', 'MetaMask');
            }
            else
            {
              pageInfo.setAttribute('currentProvider', 'unknown');
            }
        }
        document.body.appendChild(pageInfo);
      })
      Eth.web3 = document.getElementById('pure-pm-chrome-extension-page-info').getAttribute('web3');
      Eth.currentProvider = document.getElementById('pure-pm-chrome-extension-page-info').getAttribute('currentProvider');
    },
    isPrivate: function() {
      return Eth.web3 === 'private';
    },
    isMetaMask: function() {
      return Eth.currentProvider === 'MetaMask';
    },
    exists: function() {
      return Eth.web3 !== 'undefined';
    }
  }
  Eth.init();
}
