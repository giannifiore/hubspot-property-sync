const config = require("./../../config")
const request = require('request-promise-native');
const hubspotClient = require("@hubspot/api-client")

const exchangeProofForToken = async (proof) => {
    try {
      let responseBody = await request.post(`${config.hubspot.api.url}/oauth/v1/token`, {
        form: proof
      });
      responseBody = JSON.parse(responseBody)
      const hsClient = new hubspotClient.Client({
        basePath: config.hubspot.api.url
      })
      const whoami = await hsClient.oauth.accessTokensApi.getAccessToken(responseBody.access_token)
      return {
        ...responseBody,
        user: whoami.hubId
      };
    } catch (e) {
      console.error(`       > Error exchanging ${proof.grant_type} for access token`);
      console.log(e)
      return JSON.parse(e);
    }
  };

const exchangeCodeForToken = async (authCode, redirect_uri) => {
    const authorizationCodeProof = {
      grant_type: 'authorization_code',
      client_id: config.hubspot.app.client_id,
      client_secret: config.hubspot.app.client_secret,
      redirect_uri,
      code: authCode
    };
    return await exchangeProofForToken(authorizationCodeProof)
}
  
const exchangeRefreshTokenForToken = async (refresh_token, redirect_uri) => {
    const refreshTokenProof = {
        grant_type: 'refresh_token',
        client_id: config.hubspot.app.client_id,
        client_secret: config.hubspot.app.client_secret,
        redirect_uri,
        refresh_token
    };
    return await exchangeProofForToken(refreshTokenProof);
};

const getAuthURL = (redirect_uri) => {
  const authUrl = `${config.hubspot.auth.url}/oauth/authorize` +
    `?client_id=${encodeURIComponent(config.hubspot.app.client_id)}` + // app's client ID
    `&scope=${encodeURIComponent(config.hubspot.app.scopes.join(' '))}` + // scopes being requested by the app
    `&redirect_uri=${encodeURIComponent(redirect_uri)}`; // where to send the user after the consent page
  return authUrl
}

module.exports = {
    exchangeCodeForToken,
    exchangeRefreshTokenForToken,
    getAuthURL
}