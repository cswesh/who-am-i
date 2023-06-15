const { OpenAI, OpenAIChat } = require("langchain/llms/openai");
const { LLMChain } = require("langchain/chains");
const {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} = require("langchain/prompts");

module.exports = async function(prompt,input,humanText) {
    const model = new OpenAIChat({ temperature: 1 });
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
          prompt
        ),
       HumanMessagePromptTemplate.fromTemplate(humanText),
      ]);

      const chain = new LLMChain({
        prompt: chatPrompt,
        llm: model,
      });
      const response = await chain.call(input);
      const res = JSON.parse(JSON.stringify(response["text"]));
      return res
}