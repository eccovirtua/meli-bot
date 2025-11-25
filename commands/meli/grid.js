/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// HTTP client instance
const axios = require('axios');
const lastFm = 'http://ws.audioscrobbler.com/2.0/';
const { lastfmApiKey } = require('../../config.json');

/* Chain: response (axios.get) -> data (axios automatically puts the actual
 API answer inside a property called .data) -> .user (LastFm specific) */

module.exports = {
	// Command name, description and mandatory field (ID)
	data: new SlashCommandBuilder()
		.setName('meli-info')
		.setDescription('Información sobre tu cuenta')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('LastFM username to search')
			    // User must provide a name
				.setRequired(true)),

	async execute(interaction) {
		// Get username input from the user
		const username = interaction.options.getString('username');
		// Defer the reply, telling Discord that the action it's being worked on, preventing the application did not respond error
		await interaction.deferReply();

		try {
			// Make the API request
			// Last.FM requires: method, user, api_key, and format=json
			const response = await axios.get(lastFm, {
				params: {
					method: 'user.getInfo',
					user: username,
					api_key: lastfmApiKey,
					format: 'json',
				},
			});

			// Check if last.fm found the user
			if (response.data.error) {
				// First we can see it on the console
				console.error(response.data.error);
				// Then we return it for the user to see it.
				return interaction.editReply(`Error: ${response.data.message}`);
			}

			const userData = response.data.user;

			// Build an embed to display data
			const userEmbed = new EmbedBuilder()
				.setColor('#b90000') // Red Color matching website
				.setTitle(`Last.fm Stats for ${userData.name}`)
				.setURL(userData.url)
				.setThumbnail(userData.image[2]['#text']) // Large image size
				.addFields(
					// Converts user playcount (scrobbles) plain JSON to a Number then to a float number.
					{ name: 'Scrobbles', value: Number(userData.playcount).toLocaleString('es-ES'), inline: true },
					{ name: 'Nombre de usuario', value: userData.name, inline: true },
					{ name: 'Scrobleando desde', value: `<t:${Math.floor(userData.registered.unixtime)}:R>`, inline: true },
				)
				.setFooter({ text: 'Data provided by LastFm' });

			// Send the result
			await interaction.editReply({ embeds: [userEmbed] });

		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Hubo un error al intentar sacar data de Last.fm');
		}
	},
};
