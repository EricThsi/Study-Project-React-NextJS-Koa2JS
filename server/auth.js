const axios = require('axios');

const config = require('../config');

const {
  clientId: client_id,
  clientSecret: client_secret,
  requestTokenUrl,
} = config.github;

module.exports = (server) => {
  server.use(async (ctx, next) => {
    if (ctx.path === '/auth') {
      const { code } = ctx.query;
      if (!code) {
        ctx.body = "Code doesn't exist";
        return;
      }

      const result = await axios({
        method: 'POST',
        url: requestTokenUrl,
        data: {
          client_id,
          client_secret,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      });
      // console.log(result.status, result.data);

      if (result.status === 200 && result.data && !result.data.error) {
        ctx.session.githubAuth = result.data;
        const { access_token, token_type } = result.data;

        const userInfoRep = await axios({
          method: 'GET',
          url: 'https://api.github.com/user',
          headers: {
            Authorization: `${token_type} ${access_token}`,
          },
        });

        ctx.session.userInfo = userInfoRep.data;
        ctx.redirect((ctx.session && ctx.session.urlBeforeOAuth) || '/');
        ctx.session.urlBeforeOAuth = '';
      } else {
        const errorMsg = result.data && result.data.error;
        ctx.body = `request token failed, ${errorMsg}`;
      }
    } else {
      await next();
    }
  });

  server.use(async (ctx, next) => {
    const { path, method } = ctx;

    if (path === '/logout' && method === 'POST') {
      ctx.session = null;
      ctx.body = 'Logout successfully.';
    } else {
      await next();
    }
  });

  server.use(async (ctx, next) => {
    const { path, method, query } = ctx;

    if (path === '/prepare-auth' && method === 'GET') {
      const { url } = query;
      ctx.session.urlBeforeOAuth = url;
      ctx.body = 'Okay';
    } else {
      await next();
    }
  });
};
