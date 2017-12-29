
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  var activeCount = 0;
  document.querySelectorAll("input[type='password']")
    .forEach(function(t) 
    {
      if(document.activeElement ===  t) 
      { 
        activeCount++; 
        t.value = message.password;
      }
    }); 
  if(activeCount === 0) 
  {
    sendResponse({
      error:"Your cursor must be on the destination input"
    });
  }
  sendResponse({
    success: true
  });
});
