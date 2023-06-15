const { TeamsActivityHandler, MessageFactory} = require("botbuilder");
const llmCall = require('./llmCall')
const prompts = require('./promptTemplates')
const dotenv = require("dotenv").config();

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();
    
    //flag to denote the game is In Progress
    let gameON = false; let personality=""; let qNo=0; const qMax=10; let chatHistory=[]; 

    
    
    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");
      let input = context.activity.text;
      
      // Add user message to chat history 
      chatHistory.push({ 
        role: 'user', 
        content: input
      });  
    // Prepare input object with chat history 
      const inputHistory = { 
        messages: chatHistory 
      }; 
   //To start a new game block
      if(input=="new game"){
        const ngInputObj = {
          text: input,
          inputHistory
        }
        let humanText = "person name"
        // call the openai model
        const res = await llmCall(prompts.suggestPersonPrompt,ngInputObj,humanText)
        console.log(res);
        chatHistory.push({ 
            role: 'assistant',
            content: res 
        }); 
      gameON = true; // set the variable to identify if the game is already started
      personality=res; // store the personality in a variable
      await context.sendActivity(MessageFactory.text("Ready, Game Started!"));
    }
    // if the game is in progress
    else if(gameON){
      if(qNo<=qMax){ 
        const goInputObj = {
          text: input,
          person:personality,
          max: qMax
        }    
        // call the openai model
        const res1 = await llmCall(prompts.questionCheckPrompt,goInputObj,input)

      console.log(res1);
      chatHistory.push({ 
        role: 'assistant',
        content: res1
      }) 
      await context.sendActivity(MessageFactory.text(res1));
      // incrementing counter to set max tries
      if(res1.includes("Yes") || res1.includes("No"))
      qNo=qNo + 1;
      if(res1.includes("correct") || res1.includes("wrong"))
      {
        qNo=0;
        personality=""
        gameON=false;
      }
    }
    else{
      await context.sendActivity(MessageFactory.text(`You have reached maximum number of tries. The name of the person is ${personality}. Better luck next time!`));
      qNo=0;
      personality=""
      gameON=false;
    }
    }
    // if anyother questions asked by user, model will redirect to play the game
    else{
      const oInputObj = {
        text:input
      }
      // call openai model
      const res2 = await llmCall(prompts.anyOtherQuestionsPrompt,oInputObj,input)

      //const res2 = JSON.parse(JSON.stringify(response2["text"]));
      console.log(res2);
      await context.sendActivity(MessageFactory.text(res2));
    }
      
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    
  }
}

module.exports.TeamsBot = TeamsBot;
