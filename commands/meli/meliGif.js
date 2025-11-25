const { SlashCommandBuilder } = require('discord.js');
const superagent = require('superagent');
const { tenorApiKey } = require('../../config.json');


module.exports = {
	// nombre del comando /meli-gif
	data: new SlashCommandBuilder().setName('meli').setDescription('mandar una meli random'),
	async execute(interaction) {

		await interaction.deferReply({});

		const search_term = 'cat cursed';
		const apikey = tenorApiKey;
		const clientkey = 'meli-discord-bot';
		const lmt = 8;

		const choice = Math.floor(Math.random() * lmt);
		const search_url = 'https://tenor.googleapis.com/v2/search?q=' + search_term + '&key=' + apikey + '&client_key=' + clientkey + '&limit=' + lmt;


		try {
			const output = await superagent.get(search_url);

			const gifUrl = output.body.results[choice].itemurl;

			await interaction.editReply({ content: gifUrl });

		} catch (e) {
			console.error(e);
			return await interaction.editReply({ content: `No encontré ningún gif con el nombre \`${search_term}\`!` });
		}
	},
};