import dotenv from 'dotenv';
dotenv.config();

const SUGGESTIONS_CHANNEL_ID ='916351131943329822';
import {
    Client,
    Collection,
    Intents,
    MessageEmbed,
    MessageButton,
    MessageActionRow,
} from 'discord.js';
import { globby } from 'globby';
import db from 'quick.db';

const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];
const client = new Client({ intents });

client.buttons = new Collection();

client.once('ready', async () => {
    console.log('正常に起動出来ました');

    const buttons = await globby('Buttons');
    const categories = buttons
        .map(i => i.split('/')[1])
        .filter((v, i, a) => a.indexOf(v) === i);

    for (let i = 0; i < categories.length; i++) {
        const files = buttons.filter(f => f.split('/')[1] === categories[i]);
        client.buttons.set(categories[i], files);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const fields = interaction.customId.split('_');

    const commands = client.buttons.get(fields[0]);
    if (!commands) return console.log('カテゴリーを確認してください');

    const path = commands.find(f => f.split('/')[2] === `${fields[3]}.js`);
    if (!path) return console.log('パスを確認してください');

    const args = {};

    if (fields[0] === 'suggestion') {
        args.suggestionPath = `suggestions_${fields[1]}.${fields[2]}`;
        args.suggestion = db.get(args.suggestionPath);
        args.btn = (label, style = 'PRIMARY') =>
            new MessageButton()
                .setCustomId(
                    `suggestion_${fields[1]}_${fields[2]}_${label
                        .replace(/ /g, '-')
                        .toLowerCase()}`
                )
                .setLabel(label)
                .setStyle(style);
    }

    const file = await import(`./${path}`);

    if (file?.options?.staffOnly) {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
            return interaction.reply({
                content: '実行には管理者権限が必要です。。。',
                ephemeral: true,
            });
        }
    }

    file.run(client, interaction, args);
});

// Handle Messages
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.id !== SUGGESTIONS_CHANNEL_ID) return;

    // Add suggestion to database
    const cb = db.push(`suggestions_${message.author.id}`, {
        status: 'pending',
        content: message.content,
        author: { tag: message.author.tag, id: message.author.id },
        upvotes: [],
        downvotes: [],
    });
    const index = cb.length - 1;

    // Create suggestion embed
    const embed = new MessageEmbed()
        .setColor(0x5865f2)
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setDescription(message.content)
        .setTitle('投票')
        .addField('内訳', '賛成: `0`\n反対: `0`');

    // New button helper method
    const btn = (label, style = 'PRIMARY') =>
        new MessageButton()
            .setCustomId(
                `suggestion_${message.author.id}_${index}_${label
                    .replace(/ /g, '-')
                    .toLowerCase()}`
            )
            .setLabel(label)
            .setStyle(style);

    // Create buttons
    const row = new MessageActionRow().addComponents([
        btn('賛成', 'SUCCESS'),
        btn('反対', 'DANGER'),
        btn('投票者一覧','PRIMARY'),
        btn('Helper のみ'),
    ]);

    // Send embed
    const msg = await message.guild.channels.cache
        .get(SUGGESTIONS_CHANNEL_ID)
        .send({ embeds: [embed], components: [row] });

    // Create thread
    const thread = await msg.startThread({
        name: '意見・討論はこちら',
        autoArchiveDuration: 'MAX',
    });

    db.set(`suggestions_${message.author.id}.${index}.thread`, thread.id);

    // Delete original message
    message.delete();
});

client.login(process.env.TOKEN);
