
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
      passwordCount
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
  sendResponse({
    error: 'unknown command'
  });
});
