import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { initJuno } from "@junobuild/core";

//import OPENAI_API_KEY from "key.txt";
let api = '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';
let openai = new OpenAI({apiKey:api});

async function main(someText) {
  //const openai = new OpenAI({ key:"" });
  
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });
  console.log(completion.choices[0].message);
}
async function textToSpeech(someText){
  let arrayvoices = ["shimmer" , "alloy" , "echo" , "fable" ,  "onyx" , "nova"];
  let arrayfiles = ["./speech.mp3","./speech2.mp3","./speech3.mp3","./speech4.mp3","./speech5.mp3", "./speech6.mp3"];
  for(let i=0;i<arrayfiles.length;i++){
    const speechFile = path.resolve(arrayfiles[i]);
  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: arrayvoices[i],
    input: someText,
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
  }
  
};
async function createAnImage(somePrompt){
  const imageFile = path.resolve("./speech.mp3");
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: somePrompt,
    n: 1,
    size: "1024x1024"
  });
  // console.log(imageFile);
  let image_url = response.data[0].url;
  // const buffer = Buffer.from(await image.arrayBuffer());
  // await fs.promises.writeFile(imageFile, buffer);
  console.log(image_url);
}
//main("I want an app that's able to create fitness plans according to you time availability. Can you provide a 500 character description of this app?");
// textToSpeech(
//   "Imagine if there was a social network built just for ideas... A place where users are rewarded for the great ideas they share, a place where developers can earn big, building meaningful apps for thousands of people, a place where people can help decide what products are built and what features they’ll have."
//  );
//createAnImage("An social media platform designed for people to train hard and become the best version of themselves.")
