const options = {
    staffOnly: true,
};

const run = async (client, interaction, args) => {
    const embed = interaction.message.embeds[0];
    embed.setColor(0xf04747);
    embed.fields[0].name = `残念ながら落選です。。。`;

    interaction.update({ embeds: [embed], components: [] });
};

export { options, run };
