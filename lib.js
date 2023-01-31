const { Octokit } = require("octokit");

const requestGithubToken = (credentials) => {
  return fetch(`https://github.com/login/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": `application/json`,
      Accept: `application/json`,
    },
    body: JSON.stringify(credentials),
  })
    .then((res) => res.json())
    .catch((error) => {
      throw new Error(JSON.stringify(error));
    });
};

const requestGithubUserAccount = async (token) => {
  /**
   * GitHub APIのバージョンアップにより、書籍どおりに実装できなかったため、コメントアウト
   * ref: https://docs.github.com/ja/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
   */
  // return fetch(`https://api.github.com/user?access_token=${token}`)
  //   .then((res) => res.json())
  //   .catch((error) => {
  //     throw new Error(JSON.stringify(error));
  //   });
  const octokit = new Octokit({
    auth: token,
  });
  const result = await octokit.request("GET /user", {});
  return result.data;
};

async function authorizeWithGithub(credentials) {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
}

module.exports = {
  authorizeWithGithub,
};
