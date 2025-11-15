const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('reloads a command')
		.addStringOption((option) => option.setName('command').setDescription('the command to reload').setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.command.get(commandName);
		delete require.cache[require.resolve(`./${command.data.name}.js`)];
		try {
			const newCommand = require(`./${command.data.name}.js`);
			interaction.client.commands.set(newCommand.data.name, newCommand);
			await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
		}
		catch (error) {
			console.error(error);
			await interaction.reply(
				`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``,
			);
		}
		if (!command) {
			return interaction.reply(`There is no command with name \`${commandName}\`!`);
		}
	},
};

