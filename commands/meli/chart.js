/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Http client instances
const axios = require('axios');
const lastfm = 'http://ws.audioscrobbler.com/2.0/';
const { lastfmApiKey } = require('../../config.json');

// TODO: Generate actual image
// const { createCanvas, loadImage } = require('canvas');

module.exports = {
	// Command name, descriptions and its mandatory field
	data: new SlashCommandBuilder()
		.setName('meli-chart')
		.setDescription('meli chart para last.fm')
		.addStringOption(options =>
			options.setName('username')
				.setDescription('Nombre de usuario de LastFm')
				.setRequired(true),
		),
	async execute(interaction) {
		// Get username from user
		const username = interaction.options.getString('username');

		// Tell discord that it's being worked on
		await interaction.deferReply();

		try {
			// API Request:
			const response = await axios.get(lastfm, {
				params: {
					api_key: lastfmApiKey,
					user: username,
					method: 'user.getTopAlbums',
					format: 'json',
					period: '7day', // Weekly chart
					limit: '9', // 9 for a 3x3 chart.
				},
			});

			const albums = response.data.topalbums.album;

			// Check if last.fm user was found
			if (response.data.error) {
				console.error(response.data.error);
				return interaction.editReply(`Error: ${response.data.message}`);
			}

			// Safety check: did you listen to any music?
			if (!albums || albums.lenght == 0) {
				return interaction.editReply('Este usuario no ha escuchado suficiente música.');
			}

			// Build an embed to disaply chart (TEXT ONLY FOR NOW)
			const chartEmbed = new EmbedBuilder()
				.setColor('#b90000') // Red color matching last.fm
				.setTitle(`Weekly chart for ${username}`)
				.setDescription(albums.map((album, i) =>
					`**${i + 1}.** ${album.name} - *${album.artist.name}*`,
				).join('\n'));


			// Send the result
			await interaction.editReply({ embeds: [chartEmbed] });


		}
		catch (error) {
			console.error(error);
			await interaction.editReply('hubo un error, mirar la consola.');
		}
	},

};