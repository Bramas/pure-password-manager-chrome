import React from 'react';
import ReactDOM from 'react-dom';
import './page_action/index.css';
import App from './page_action/App';

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
  salt: false
}


function sendPasswordToPage(password) {
  chrome.tabs.executeScript(null, {
    file: 'script_injection.js'
  }, function() {
    chrome.tabs.query({active:true,currentWindow:true},function(tabs){
      chrome.tabs.sendMessage(tabs[0].id,{password}, function(response){

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
      });
    });
  });
}

const Action = withStyles(styles)(({password, classes}) =>
  <Button
    onClick={() => sendPasswordToPage(password)}
    disabled={password === false}
    raised color="primary"
    className={classes.button} >
      Insert
  </Button>
)

function render() {
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
      store.salt = host;
      render();
});

/*chrome.storage.local.get('passphrase', function(object) {
  console.log(object.passphrase);
  if(object.passphrase)
    document.getElementById('passphrase').value = object.passphrase;
});
*/
