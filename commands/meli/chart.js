/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

// Http client instances
const axios = require('axios');
const lastfm = 'http://ws.audioscrobbler.com/2.0/';
const { lastfmApiKey } = require('../../config.json');

// Generate actual image
const { createCanvas, loadImage } = require('canvas');

module.exports = {
	// Command name, descriptions and its mandatory field
	data: new SlashCommandBuilder()
		.setName('meli-chart')
		.setDescription('meli chart 3x3 7-day')
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

			// Prepare the canvas
			const cellSize = 300; // 300x300 pixels images
			const canvasSize = cellSize * 3; // Full imagesize, make it 900x900 to readability
			const canvas = createCanvas(canvasSize, canvasSize);
			const ctx = canvas.getContext('2d');

			// Fill background with a black color, in case the image doesn't load it's not transparent
			ctx.fillStyle = '#000000';
			ctx.fillRect(0, 0, canvasSize, canvasSize);

			// -- Load  images --
			// The idea is to load all images at once
			// We create an array of promises to load them all at once
			const imagePromises = albums.map(album => {
				// Given that last.fm provides several imabge sizes, index 3 is extralarge (300x300)
				const imageUrl = album.image?.[3]['#text'];

				// If there's a URL, try to load it, if not, then null
				return imageUrl ? loadImage(imageUrl).catch(() => null) : Promise.resolve(null);
			});

			// Now wait for all 9 images to finish the download attempt
			const loadedImages = await Promise.all(imagePromises);


			// Draw the image canvas

			// loop through the loaded images (0 to 8)
			for (let i = 0; i < loadedImages.length; i++) {
				const img = loadedImages[i];
				if (!img) continue; // skip if image failed to load

				// Imagine items 0-8
				// 0, 1, 2 go in row 0
				// 3, 4, 5 go in row 1
				// 6, 7, 8 go in row 2

				const colIndex = i % 3;
				const rowIndex = Math.floor(i / 3);

				const x = colIndex * cellSize;
				const y = rowIndex * cellSize;

				// draw the image at coords x & y, stretching it to fit the cell size
				ctx.drawImage(img, x, y, cellSize, cellSize);
			}
			const attachment = new AttachmentBuilder(canvas.toBuffer(), { name:  'chart.png' });

			// Build an embed to disaply chart (TEXT ONLY FOR NOW)
			const chartEmbed = new EmbedBuilder()
				.setColor('#b90000') // Red color matching last.fm
				.setTitle(`Weekly chart for ${username}`)
				.setURL(`https://www.last.fm/user/${username}`)
				.setImage('attachment://chart.png')
				.setFooter({ text: 'Generado por Meli & Last.fm' });


			// Send the result
			await interaction.editReply({ embeds: [chartEmbed], files: [attachment] });


		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Error interno del sistema. Contactar al creador de Meli-bot');
		}
	},

};