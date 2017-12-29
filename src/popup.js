import React from 'react';
import ReactDOM from 'react-dom';
import './page_action/index.css';
import App from './page_action/App';
import Paper from 'material-ui/Paper';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import blueGrey from 'material-ui/colors/blueGrey';
import deepPurple from 'material-ui/colors/deepPurple';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';

const theme = createMuiTheme({
  palette: {
    primary: blueGrey,
    secondary: deepPurple,
  },
  status: {
    danger: 'orange',
  },
});
const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  }
});

const store = {
  error: false,
  salt: false,
  tabId: null,
  passwordFieldCount: 0
}


function init() {
  chrome.tabs.executeScript(null, {
    file: 'script_injection.js'
  }, function() {
    chrome.tabs.query({active:true,currentWindow:true},
      function(tabs)
      {
        store.tabId = tabs[0].id;
        var currentTabUrl = tabs[0].url;
        var regex =
          /*12       3    45     6 7         8          9 A        B   C                   D  E        F 0   */
          /* proto         user    pass      host         port     path                       query      frag */
          /^((\w+):)?(\/\/((\w+)?(:(\w+))?@)?([^\/\?:]+)(:(\d+))?)?(\/?([^\/\?#][^\?#]*)?)?(\?([^#]+))?(#(\w*))?/;
          var r = currentTabUrl.match(regex)
          var host = r[8] ? r[8].split('.').slice(-2)[0] : "";
          store.salt = host;
          console.log('init Done, now asking for password destination', store);
          chrome.tabs.sendMessage(store.tabId, {cmd:'whatDestination'}, function(response){
            //if(response.activeCount == 0 && response.passwordCount >= 3) {
            //  store.error = 'There are '+response.passwordCount+' password fields, so we'
            //}
            store.passwordFieldCount = response.passwordCount;
            render();
          });
      });
  });
}
init();
function sendPasswordToPage(password) {
  chrome.tabs.sendMessage(
    store.tabId,
    {password, cmd:'sendPassword'},
    function(response){
      console.log(response);
      if(response.error) {
        store.error = response.error;
        render();
        return;
      }
      if(response.success) {
        window.close();
        return;
      }
    }
  );
}

const Action = withStyles(styles)(({password, classes}) =>
  <span><Button
    onClick={() => sendPasswordToPage(password)}
    disabled={password === false}
    raised color="primary"
    className={classes.button} >
      Insert in the page
  </Button>
  {store.passwordFieldCount > 1 ?
    <span>
      {store.passwordFieldCount} empty password fields
      will be filled automatically
    </span> : ''
  }
  </span>
)

function render() {
  if(store.passwordFieldCount == 0) {
  ReactDOM.render(
    <Paper style={{padding: 20}}>
      There is no empty password field in the page. Clear the password fields
      you want me to fill automatically, then click again on the extension.
    </Paper>, document.getElementById('root'));
    return;
  }
  ReactDOM.render(
    <MuiThemeProvider theme={theme}>
      <App error={store.error} identiconSize={200} salt={store.salt} actionButton={Action} />
    </MuiThemeProvider>, document.getElementById('root'));
}
ReactDOM.render(
  <div>Loading</div>, document.getElementById('root'));




var scrypt = require('./scrypt');


function clearForm(e) {
  e.preventDefault();
  document.getElementById('passphrase').value = '';
  document.getElementById('salt').value = '';
  chrome.runtime.sendMessage(null,
    {passphrase:''}
  );
}
/*
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
    }, (password) => {
        password = password.replace(/\+|\//igm, '').substr(0,12);
        sendPasswordToPage(password);
    });
}*/

chrome.runtime.sendMessage(null,
  {cmd:'requestPassphrase'},
  function(response) {
      if(response.passphrase)
        document.getElementById('passphrase').value = response.passphrase;
  }
);


/*chrome.storage.local.get('passphrase', function(object) {
  console.log(object.passphrase);
  if(object.passphrase)
    document.getElementById('passphrase').value = object.passphrase;
});
*/
