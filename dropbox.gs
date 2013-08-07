function setDropBoxApi(){
  var key = 'KEY';
  var secret = 'SECRET';
  ScriptProperties.setProperty("dropboxKey",    key);
  ScriptProperties.setProperty("dropboxSecret", secret);
}
/**
 * API url for Dropbox.
 * @type {String}
 * @const
 */
function oAuth2_GetCode() {
  var fakeurl = 'https://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id='+ScriptProperties.getProperty("dropboxKey");
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var app = UiApp.createApplication().setTitle('Dropbox api').setHeight(140).setWidth(150);
  var grid = app.createGrid(4, 1);
  
  grid.setWidget(0, 0, app.createAnchor("Get Dropbox Code", fakeurl));
 
  grid.setWidget(1, 0, app.createLabel('Write code below:'));
  grid.setWidget(2, 0, app.createTextBox().setName('code').setId('code'));
  grid.setWidget(3, 0, app.createLabel('').setId('status'));
  
  // Create a vertical panel and add the grid to the panel
  var panel = app.createVerticalPanel();
  panel.add(grid);
  //////////////////////////////////////////////////////////////////////////////////////////
  var buttonPanel = app.createHorizontalPanel().setStyleAttribute("margin-top", "10px");
  var button = app.createButton('Activate');
  var submitHandler = app.createServerClickHandler('submit');
  submitHandler.addCallbackElement(grid);
  button.addClickHandler(submitHandler);
  buttonPanel.add(button);
  
  panel.add(buttonPanel);
  
  app.add(panel);
  doc.show(app);
}
function submit(e){
  if(e.parameter.code == '') return;
  var result = oAuth2_GetToken(e.parameter.code);
  var app = UiApp.getActiveApplication();
  if(result.access_token){
    app.getElementById('status').setText('Approved').setStyleAttribute("color", "green");
  }
  else {
    app.getElementById('status').setText('Error: Try Again').setStyleAttribute("color", "red")
  }
  return app;
}
function oAuth2_GetToken(val){
  var options = {method : "POST", oAuthUseToken: "always"},
      code = 'code='+val;
  var url = 'https://api.dropbox.com/1/oauth2/token?',
      type = '&grant_type=authorization_code',
      key = '&client_id=' + ScriptProperties.getProperty("dropboxKey");
  var secret = '&client_secret=' + ScriptProperties.getProperty("dropboxSecret");
  url += code + type + key + secret;
  Logger.log(url);
  try {
    var cavab = UrlFetchApp.fetch(url,options);
    ScriptProperties.setProperty("dropbox_token", Utilities.jsonParse(cavab.getContentText()).access_token);
    Logger.log(cavab);
    return Utilities.jsonParse(cavab.getContentText());
  }
  catch(e){
    Logger.log(e)
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////[ Dropbox functions ]/////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function GetInfo(){
  var 
      options = {
        method : "GET",
        headers : {
          "Authorization" : "Bearer " + ScriptProperties.getProperty("dropbox_token")
        }
      },
      url = 'https://api.dropbox.com/1/account/info';
  try {
    var cavab = UrlFetchApp.fetch(url,options); 
    Logger.log(cavab);
  }
  catch(e){
    Logger.log(e)
  }
}

function GetFile(path){

  var path = path, 
      options = {
        method : "GET",
        headers : {
          "Authorization" : "Bearer " + ScriptProperties.getProperty("dropbox_token")
        }
      },
      url = 'https://api-content.dropbox.com/1/files/dropbox/' + path;
  try {
    var cavab = UrlFetchApp.fetch(url,options); 

    var data = cavab.getContentText().toString();   
    return data
  }
  catch(e){
    Logger.log(e)
  }
}

function GetFileList(path){

  var path = path, 
      options = {
        method : "GET",
        headers : {
          "Authorization" : "Bearer " + ScriptProperties.getProperty("dropbox_token")
        }
      },
      url = 'https://api.dropbox.com/1/metadata/dropbox/' + path;
  try {
    var cavab = UrlFetchApp.fetch(url,options); 
    //Logger.log(cavab)
    return Utilities.jsonParse(cavab.getContentText());
  }
  catch(e){
    Logger.log(e)
  }
}

