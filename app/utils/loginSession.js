/**
 * Created by Administrator on 2017-12-27.
 */
const axios = require('axios');

// Save an authentacition token
function saveAuth ( type, token, uid) {
  let authConfig = type + ':' + token;
  sessionStorage.setItem( 'auth', authConfig );
  sessionStorage.setItem( 'token', type + ' ' + token );
  window.localStorage.setItem('uid', uid);
  setAuth( type, token );
}

// Remove authorization token
function dropAuth () {
  sessionStorage.removeItem( 'auth' );
  sessionStorage.removeItem( 'token' );
  window.localStorage.removeItem('uid');

  setAjax( null );
}

// Set an anthorization token
function setAuth( type, token ) {
  let authString = type + ' ' + token;
  setAjax( authString );
}

// Set Authorization header for authentication
function setAjax( authString ) {
    axios.defaults.headers.Authorization = authString;
}

// load authorization data from sessionStorage
function initializeAuth() {
  let authConfig = sessionStorage.getItem( 'auth' );
  if ( !authConfig ) {
    return window.location.replace('/#login');
  }
  let splittedAuth = authConfig.split( ':' );
  let type = splittedAuth[ 0 ],
    token = splittedAuth[ 1 ];
  setAuth( type, token );
}

function getAuthString() {
  return sessionStorage.getItem( 'token' );
}

export  {saveAuth, dropAuth, getAuthString};
