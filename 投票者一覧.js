import db from 'quick.db';

const run = async (client, interaction, args) => {
　const fields = interaction.customId.split('_');　
  if (fields[0] === 'suggestion') {
    args.suggestionPath = `suggestions_${fields[1]}.${fields[2]}`;
    args.suggestion = db.get(args.suggestionPath);
    const suggestion = args.suggestion;
    const up = suggestion.upvotes.map(x=>"<@"+x+">")
    const up1 = up.join("\n")
    const down = suggestion.downvotes.map(x=>"<@"+x+">")
    const down1 = down.join("\n")
    
    
    
   interaction.reply({
     　　　content:`賛成者:\n`+up1+`\n反対者:\n`+down1,
     ephemeral: true,
            });

}
};

export { run };
