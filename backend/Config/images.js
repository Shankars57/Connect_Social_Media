import ImageKit from "imagekit";
import 'dotenv/config'

export let imagekit = new ImageKit({
  publicKey: process.env.PublicKey,
  privateKey:process.env.PrivateKey ,
  urlEndpoint: process.env.UrlEndpoint,
});
