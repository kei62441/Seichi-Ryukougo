const options = {
    staffOnly: true,
};

const run = async (client, interaction, args) => {
    const embed = interaction.message.embeds[0];
    embed.setColor(0x43b581);
    embed.fields[0].name = `入賞おめでとうございます！:tada:`;

    interaction.update({ embeds: [embed], components: [] });
};

export { options, run };
