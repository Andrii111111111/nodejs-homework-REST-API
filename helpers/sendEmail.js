import ElasticEmail from "@elasticemail/elasticemail-client";
import "dotenv/config";

const { ELASTIC_API_KEY } = process.env;

const defaultClient = ElasticEmail.ApiClient.instance;

const { apikey } = defaultClient.authentications;
apikey.apiKey = ELASTIC_API_KEY;

const api = new ElasticEmail.EmailsApi();

const callback = function (error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log("API called successfully.");
  }
};

const sendMail = (email) => {
  api.emailsPost(email, callback);
};

export default sendMail;
