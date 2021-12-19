import { MessageActionRow } from 'discord.js';

const options = {
    staffOnly: true,
};

const run = async (client, interaction, args) => {
    const userRow = interaction.message.components[0];
    userRow.spliceComponents(2, 1);

    const staffRow = new MessageActionRow().addComponents([
        args.btn('入賞', 'SUCCESS'),
        args.btn('落選', 'DANGER'),
        args.btn('戻る', 'SECONDARY'),
    ]);

    interaction.update({ components: [userRow, staffRow] });
};

export { options, run };
