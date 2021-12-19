const options = {
    staffOnly: true,
};

const run = async (client, interaction, args) => {
    const userRow = interaction.message.components[0];

    userRow.addComponents([args.btn('Helper のみ')]);

    interaction.update({
        components: [userRow],
    });
};

export { options, run };
