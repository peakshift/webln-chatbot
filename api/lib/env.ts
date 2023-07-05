const COOKIE_SECRET = "123asdqwer213789sdf";

const ENV = {
  COOKIE_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

export default ENV;
