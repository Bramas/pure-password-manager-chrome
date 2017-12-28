
document.getElementById('clear').onclick = function(e) {
  e.preventDefault();
  document.getElementById('passphrase').value = '';
  document.getElementById('salt').value = '';
  chrome.runtime.sendMessage(null,
    {passphrase:''}
  );
};
document.getElementById('submit').onclick = function(e) {
  e.preventDefault();
  var passphrase = document.getElementById('passphrase').value;
  if(false) //saveto local storage
  {
    // TODO: Needs to be encrypted
    chrome.storage.local.set({passphrase: passphrase});
  }
  chrome.runtime.sendMessage(null,
    {passphrase:passphrase}
  );
  scrypt(
    passphrase,
    document.getElementById('salt').value,{
      N: 16384,
      r: 8,
      p: 1,
      dkLen: 64,
      encoding: 'base64',
      interruptStep : 200
    },function(password) {
      password = password.replace(/\+|\//igm, '').substr(0,12);
      chrome.tabs.executeScript(null, {
        file: 'src/page_action/script_injection.js'
      }, function() {
        chrome.tabs.query({active:true,currentWindow:true},function(tabs){
          chrome.tabs.sendMessage(tabs[0].id,{password}, function(response){
            
            console.log(response);
            if(response.error) {
              document.getElementById('error').innerHTML = response.error;
              return;
            }
            if(response.success) {
              window.close();
              return;
            }
          });
        });
      });
  });
}

chrome.runtime.sendMessage(null,
  {cmd:'requestPassphrase'},
  function(response) {
      if(response.passphrase)
        document.getElementById('passphrase').value = response.passphrase;
  }
);

chrome.tabs.query({active:true,currentWindow:true},function(tabs){
    //'tabs' will be an array with only one element: an Object describing the active tab
    //  in the current window.
    var currentTabUrl = tabs[0].url;
    var regex = 
      /*12       3    45     6 7         8          9 A        B   C                   D  E        F 0   */
      /* proto         user    pass      host         port     path                       query      frag */
      /^((\w+):)?(\/\/((\w+)?(:(\w+))?@)?([^\/\?:]+)(:(\d+))?)?(\/?([^\/\?#][^\?#]*)?)?(\?([^#]+))?(#(\w*))?/;
      var r = currentTabUrl.match(regex)
      var host = r[8] ? r[8].split('.').slice(-2)[0] : "";
    document.getElementById('salt').value = host;
});

/*chrome.storage.local.get('passphrase', function(object) {
  console.log(object.passphrase);
  if(object.passphrase)
    document.getElementById('passphrase').value = object.passphrase;
});
*/