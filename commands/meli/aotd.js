/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const lastfm = 'http://ws.audioscrobbler.com/2.0/';
const { lastfmApiKey } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('meli-top')
		.setDescription('meli canciones top'),

	async execute(interaction) {
		await interaction.deferReply();

		try {
			// Api request
			const response = await axios.get(lastfm, {
				params: {
					api_key: lastfmApiKey,
					limit: '10',
					method: 'chart.getTopTracks',
					format: 'json',
				},
			});


			if (response.data.error) {
				console.log(response.data.error);
				return interaction.editReply(`Error: ${response.data.message}`);
			}

			const topTracks = response.data.tracks.track;


			// Mapping the global tracks string
			const trackListString = topTracks.map((track, index) => {
				const rank = index + 1;
				const name = track.name;

				// Artist is an object containing name
				const artist = track.artist.name;
				// Format listeners numbers
				const listeners = Number(track.listeners).toLocaleString('es-ES');

				return `**${rank}.** ${name} - *${artist}* \n   └ 🎧 ${listeners} oyentes`;
			}).join('\n\n'); // Double \n for better spacing


			if (topTracks.length == 0) {
				return interaction.editReply('No tracks found for this week');
			}

			const topTracksEmbed = new EmbedBuilder()
				.setColor('#b90000') // Red Color matching lastfm
				.setTitle('Top Tracks esta semana.')
				.setDescription(trackListString)
				.setFooter({ text: 'Last.fm & Meli' });

			await interaction.editReply({ embeds: [topTracksEmbed] });

		}
		    catch (error) {
			console.log(error);
			await interaction.editReply(`Se ha producido un error ${error}`);
		}
	},
};