const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	// nombre del comando /meli-gif
	data: new SlashCommandBuilder().setName('meli-gif').setDescription('meli buscadora de gif.'),
	async execute(interaction) {
		await interaction.reply(
			'bot meli ha encontrado los siguientes gif.',
		);
	},
};

