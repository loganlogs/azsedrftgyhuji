// API
const { MessageEmbed, Client, Collection, Intents } = require('discord.js');
const client = new Client({ disableMentions: "everyone" }, { ws: { intents: Intents.PRIVILEGED } });
const fs = require("fs");
const path = require("path");
// Settings
const settings = require('./commands/settings.json');
const token = settings.token;
const prefix = settings.prefix;
const author = settings.author;
const enableGuilds = settings.AllowGuilds;
// White Listing/Black Listing
const Bacess = require("./commands/database/blacklist.json");
// Commando Structure
client.commands = new Collection();

let commandDir = "commands";

for (const category of fs.readdirSync(`./${commandDir}`)) {
    if (!fs.statSync(`./${commandDir}/${category}`).isDirectory()) continue;
    const direc2 = fs.readdirSync(path.join(`./${commandDir}/${category}`)).filter(file => file.endsWith(".js"))
    for (const f of direc2) {
        const command = require(`./${commandDir}/${category}/${f}`);
        client.commands.set(command.name, command);
    }
    for (const folder of fs.readdirSync(`./${commandDir}/${category}`)) {
        if (!fs.statSync(`./${commandDir}/${category}/${folder}`).isDirectory()) continue;
        const direc = fs.readdirSync(path.join(`./${commandDir}/${category}/${folder}`)).filter(file => file.endsWith(".js"))
        for (const f of direc) {
            const command = require(`./${commandDir}/${category}/${folder}/${f}`);
            client.commands.set(command.name, command);
        }
        for (const files of fs.readdirSync(`./${commandDir}/${category}/${folder}`)) {
            const command = require(`./${commandDir}/${category}/${folder}/${files}`);

            client.commands.set(command.name, command);
        }
    }
}

// Listeners
process.setMaxListeners(300);
// Customizations
const { red, green, magenta, greenBright, magentaBright, yellowBright, blue, blueBright, grey, redBright, yellow, cyan, cyanBright } = require('chalk');
// Title
console.log(magenta(`

                            ██████╗ ██╗      █████╗ ██████╗ ███████╗███████╗   
                            ██╔══██╗██║     ██╔══██╗██╔══██╗██╔════╝██╔════╝   
                            ██████╔╝██║     ███████║██║  ██║█████╗  █████╗     
                            ██╔══██╗██║     ██╔══██║██║  ██║██╔══╝  ██╔══╝     
                            ██████╔╝███████╗██║  ██║██████╔╝███████╗███████╗██╗
                            ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚═╝
                       
                               Anti Nuke | Sw9lly | Auteur: ${author}

`));

client.on("ready", () => {
    // UserCount
    const userCount = client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c, 0);
    // Login
    console.log(magentaBright('              ════════════════════════════════════════════════════════════════════════════════'));
    console.log(magentaBright(`                                           Garde: ${client.user.username}#${client.user.discriminator} `));
    console.log(magentaBright('              ════════════════════════════════════════════════════════════════════════════════'));
    // Status
    // Status Title Options
    // Status Activity Options
    let ActiOptions = ["STREAMING", "PLAYING", "LISTENING", "WATCHING"];
    setInterval(function () {
        // Randomise
        let randomsieActivity = ActiOptions[Math.floor(Math.random() * ActiOptions.length)];
        // Activity
        client.user.setActivity({
            name: `${userCount} utilisateurs protégés.`,
            type: randomsieActivity,
            url: "https://www.twitch.tv/discord"
        });

    }, 10000); // Change 10 Every Second(s)
});

// Commands
client.on("message", message => {

    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;

    // Logs Command
    if (message.content.startsWith(prefix)) {

        const d = new Date();
        const date = d.getHours() + ":" + d.getMinutes() + ", " + d.toDateString();

        console.log(green(`[COMMANDE UTILISEE] : ${message.content} | ${message.author.tag} | [SERVEUR] : ${message.guild.name} | [TEMPS] : ${date}`))

        // Args
        const args = message.content.slice(prefix.length).trim().split(/ +/);

        const command = args.shift().toLowerCase();

        if (!client.commands.has(command)) return;

        try {
            client.commands.get(command).run(client, message, args);

        } catch (error) {
            console.error(error);
        }
    }


})

client.on("guildCreate", async guild => {
    // This event triggers when the bot joins a guild.
    console.log(greenBright(`\n[SERVEUR REJOINT] ${guild.name} | [ID] ${guild.id} | [ (+) MEMBRES: ${guild.memberCount}]\n`));

    const AllowedGuildIDs = settings.PermittedGuilds.find((g) => g === `${guild.id}`);
    const PrivGuild = settings.LockGuildID;
    if (enableGuilds === false ) {
        if (guild.id !== PrivGuild) {
            return guild.leave().then(
                console.log(greenBright('Invitation dans un serveur mais je l\'ai quitté.'))
            );
        } else {
            return console.log(greenBright('Invité dans un serveur autorisé.'));
        }
    } else {
        if (guild.id === AllowedGuildIDs || PrivGuild) {
            return console.log(greenBright('Invité dans un serveur.'));
        } else {
            return guild.leave().then(
                console.log(greenBright('Invitation dans un serveur mais je l\'ai quitté.'))
            );
        }
    }
});

// When Bot leaves
client.on("guildDelete", guild => {
    console.log(red(`\n[SERVEUR QUITTER] ${guild.name} | [ID] ${guild.id} | [ (-) MEMBRES: ${guild.memberCount}]\n`));
});

// Blacklist User from server
client.on('guildMemberAdd', member => {
    const BlacklistedUserID = Bacess.find((u) => u === `${member.id}`);
    const noAcess = new MessageEmbed()
        .setTitle('Acces à un serveur: ' + member.guild.name)
        .setDescription(`Tu as été blacklist dans **${member.guild.name}** et ne peut plus y acceder.\n
    **Créateur:** \`${member.guild.owner.user.tag}\` | <@${member.guild.owner.id}>
    **Membres:** ${member.guild.memberCount}\n
    *Nous te suggestions de mp le créateur pour une demande d'unblacklist.*
    `)
        .setTimestamp(Date.now());

    if (member.id === BlacklistedUserID) {
        member.send(noAcess)
        setTimeout(function () {
            member.ban({
                reason: `Utilisateur Blacklist`
            })
        }, 2000);
        console.log(red(`Utilisateur Blacklist: ${member.user.tag} a essayer de rejoindre ${member.guild.name} et a été banni.`))
    } else {
        return console.log(greenBright(`Utilisateur: ${member.user.tag} a rejoint ${member.guild.name}.`));
    }
});

// Fetch Ban
client.on("guildBanAdd", async (guild, user) => {

    const eventsTimestamp = Date.now().toString()

    const fetchingLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: "MEMBER_BAN_ADD",
    }).catch((err) => {
        return console.log(`${red("[ERREUR DE LOGS]: True")}\n${red("[DESCRIPTION DE L'ERREUR.]: " + err)}`)
    });

    if (!fetchingLogs) return console.log(red("[ERREUR] Impossible de fetch les logs."));

    const banLog = fetchingLogs.entries.first();

    if (!banLog) {
        return console.log(red(`[ERREUR FETCH LOGS]: Ce type de logs: 'MEMBER_BAN_ADD' n'a pas été vu avant l'event 'guildBanAdd'.`));
    } else {
        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un event a été sauté.")}\n${yellowBright("[Serveur]: " + guild.name)}\n${green("[EVENT]: 'guildBanAdd'")}\n${greenBright("[TYPE DE LOGS]: 'MEMBER_BAN_ADD'")}`)

        const { executor, target, createdAt, createdTimestamp } = banLog;

        console.log(`${greenBright(`[DESCRIPTION D'EVENT.]: [UTILISATEUR]: ${target.tag} a été banni du serveur.`)}`);

        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        /**
        * Checks Whitelisted & Utilisateurs de Confiance Before banning
        */
        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');
        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        const successfulBan = new MessageEmbed()
            .setDescription(`**Ban Par:** ${executor.tag} \n**Banni:** ${target.tag} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const unsuccessfulBan = new MessageEmbed()
            .setDescription(`**Ban Autorisé Par:** ${executor.tag} \n**Banni:** ${target.tag} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné.`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            guild.members.ban(executor.id, {
                reason: `Antiban`
            }).then(guild.owner.send(successfulBan).catch((err) => {
                return console.log(red("[Owner]: " + guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
            }))
                .then(guild.members.unban(target.id, {
                    reason: "Antiban"
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sanction]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Non Donné")}\n${magentaBright("[Sanction Erreur]: " + err)}\n${grey("======================================")}\n`) + guild.owner.send(unsuccessfulBan);
                });
        } else if (logtime2 === eventtime2) {
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            guild.members.ban(executor.id, {
                reason: `Ban  .`
            }).then(guild.owner.send(successfulBan).catch((err) => {
                return console.log(red("[Owner]: " + guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
            }))
                .then(guild.members.unban(target.id, {
                    reason: "Membree d'un ban  "
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sanction]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Non Donné")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + guild.owner.send(unsuccessfulBan);
                });
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (User)")}\n${grey("======================================")}\n`)
        }
    }

})

// Fetch Kick
client.on("guildMemberRemove", async member => {

    const eventsTimestamp = Date.now().toString()

    const FetchingLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: "MEMBER_KICK",
    }).catch((err) => {
        return console.log(`${red("[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));

    const kickLog = FetchingLogs.entries.first();

    if (!kickLog) {
        return console.log(red(`[Erreur Fetch Log]: Ce type de log: 'MEMBER_KICK' n'a pas été vu avant l'event 'guildMemberRemove'.`));
    } else {
        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + member.guild.name)}\n${green("[Event]: 'guildMemberRemove'")}\n${greenBright("[Type De Log]: 'MEMBER_KICK'")}`)

        const { executor, target, createdAt, createdTimestamp } = kickLog;

        console.log(`${greenBright(`[Event Desc.]: [USER]: ${target.tag} a été kick / retiré du serveur.`)}`);
        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        /**
         * Checks Whitelisted & Utilisateurs de Confiance Before banning
         */

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');

        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        const successfulKick = new MessageEmbed()
            .setDescription(`**Kick   Par:** ${executor.tag} \n**Membre:** ${target.tag} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const unsuccessfulKick = new MessageEmbed()
            .setDescription(`**Kick   Par:** ${executor.tag} \n**Membre:** ${target.tag} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné.`)
            .setColor("RED")
            .setTimestamp(Date.now());

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (User)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === member.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            member.guild.members.ban(executor.id, {
                reason: `Antikick`
            }).then(member.guild.owner.send(successfulKick).catch((err) => {
                return console.log(red("[Owner]: " + member.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
            }).then(() => {
                console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
            })).catch((err) => {
                return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + member.guild.owner.send(unsuccessfulKick).catch((err) => {
                    return console.log(red("[Owner]: " + member.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            });
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (User)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === member.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            member.guild.members.ban(executor.id, {
                reason: `Antikick`
            }).then(member.guild.owner.send(successfulKick).catch((err) => {
                return console.log(red("[Owner]: " + member.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
            }).then(() => {
                console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
            })).catch((err) => {
                return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + member.guild.owner.send(unsuccessfulKick).catch((err) => {
                    return console.log(red("[Owner]: " + member.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            });
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (User)")}\n${grey("======================================")}\n`)
        }
    }

});

// Channel Create
client.on("channelCreate", async (channel) => {

    const eventsTimestamp = Date.now().toString()

    if (!channel.guild) return;

    const FetchingLogs = await client.guilds.cache.get(channel.guild.id).fetchAuditLogs({
        limit: 1,
        type: "CHANNEL_CREATE",
    }).catch((err) => {
        return console.log(`${red("[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));

    const ChannelLog = FetchingLogs.entries.first();

    if (!ChannelLog) {
        return console.log(red(`[Erreur Fetch Log]: Ce type de log: 'CHANNEL_CREATE' n'a pas été vu avant l'event 'channelCreate'.`));
    } else {
        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + channel.guild.name)}\n${green("[Event]: 'channelCreate'")}\n${greenBright("[Type De Log]: 'CHANNEL_CREATE'")}`);

        console.log(`${greenBright(`[Event Desc.]: [CHANNEL]: "${channel.name}" a été créé dans le serveur`)}`);
        const { executor, createdAt, createdTimestamp } = ChannelLog;

        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        const successfulBanText = new MessageEmbed()
            .setDescription(`**Création de Salon  e Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon:** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanCategory = new MessageEmbed()
            .setDescription(`**Création de Catégorie  e Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanVoice = new MessageEmbed()
            .setDescription(`**Création de Salon Vocale  e Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanStore = new MessageEmbed()
            .setDescription(`**Création de Salon Magasin  e Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanNews = new MessageEmbed()
            .setDescription(`**Création de Salon Annonce  e Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanUnkownChannel = new MessageEmbed()
            .setDescription(`**Création de Salon Inconnu  e Par:** ${executor.tag} \n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const unsuccessfulBan = new MessageEmbed()
            .setDescription(`**Création de Salon  e Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné.`)
            .setColor("RED")
            .setTimestamp(Date.now());

        /**
         * Checks Whitelisted & Utilisateurs de Confiance Before banning
         */
        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');

        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + channel.name + " (Channel)")}`);
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === channel.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (channel.type === "text") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Salon`
                }).then(channel.guild.owner.send(successfulBanText).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "category") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Catégorie`
                }).then(channel.guild.owner.send(successfulBanCategory).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "voice") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Salon Vocale`
                }).then(channel.guild.owner.send(successfulBanVoice).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "store") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Magasin`
                }).then(channel.guild.owner.send(successfulBanStore).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "news") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Salon D'Annonce`
                }).then(channel.guild.owner.send(successfulBanNews).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Salon Inconnu`
                }).then(channel.guild.owner.send(successfulBanUnkownChannel).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            }
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + channel.name + " (Channel)")}`);
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === channel.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (channel.type === "text") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Salon`
                }).then(channel.guild.owner.send(successfulBanText).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "category") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Catégorie`
                }).then(channel.guild.owner.send(successfulBanCategory).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "voice") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Salon Vocale`
                }).then(channel.guild.owner.send(successfulBanVoice).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "store") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Magasin`
                }).then(channel.guild.owner.send(successfulBanStore).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "news") {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Salon D'Annonce`
                }).then(channel.guild.owner.send(successfulBanNews).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else {
                channel.guild.member(executor.id).ban({
                    reason: `Création de Inconnu`
                }).then(channel.guild.owner.send(successfulBanUnkownChannel).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            }
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + channel.id + " (Channel ID)")}\n${grey("======================================")}\n`)
        }
    }
});

// Channel Delete
client.on("channelDelete", async (channel) => {
    const eventsTimestamp = Date.now().toString()

    if (!channel.guild) return;

    const FetchingLogs = await client.guilds.cache.get(channel.guild.id).fetchAuditLogs({
        limit: 1,
        type: "CHANNEL_DELETE",
    }).catch((err) => {
        return console.log(`${red("[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));

    const ChannelLog = FetchingLogs.entries.first();

    if (!ChannelLog) {
        return console.log(red(`[Erreur Fetch Log]: Ce type de log: 'CHANNEL_DELETE' n'a pas été vu avant l'event 'channelDelete'.`));
    } else {
        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + channel.guild.name)}\n${green("[Event]: 'channelDelete'")}\n${greenBright("[Type De Log]: 'CHANNEL_DELETE'")}`)

        console.log(`${greenBright(`[Event Desc.]: [CHANNEL]: "${channel.name}" a été supprimé du serveur`)}`);

        const { executor, createdAt, createdTimestamp } = ChannelLog;

        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        const successfulBanText = new MessageEmbed()
            .setDescription(`**Suppression de Salon   Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanCategory = new MessageEmbed()
            .setDescription(`**Suppression de Catégorie   Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanVoice = new MessageEmbed()
            .setDescription(`**Suppression de Salon Vocale   Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanStore = new MessageEmbed()
            .setDescription(`**Suppression de Magasin   Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanNews = new MessageEmbed()
            .setDescription(`**Suppression de Salon D'Annonce   Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanUnkownChannel = new MessageEmbed()
            .setDescription(`**Suppression de Salon Inconnu   Par:** ${executor.tag} \n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const unsuccessfulBan = new MessageEmbed()
            .setDescription(`**Suppression de Salon   Par:** ${executor.tag}\n\n**Salon:** \`${channel.name}\` \n**ID Du Salon** ||${channel.id}|| \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné.`)
            .setColor("RED")
            .setTimestamp(Date.now());

        /**
         * Checks Whitelisted & Utilisateurs de Confiance Before banning
         */
        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');
        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + channel.name + " (Channel)")}`);
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === channel.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (channel.type === "text") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanText).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "category") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Catégorie`
                }).then(channel.guild.owner.send(successfulBanCategory).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "voice") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanVoice).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "store") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Magasin`
                }).then(channel.guild.owner.send(successfulBanStore).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "news") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanNews).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanUnkownChannel).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            }
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + channel.name + " (Channel)")}`);
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === channel.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (channel.type === "text") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanText).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "category") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Catégorie`
                }).then(channel.guild.owner.send(successfulBanCategory).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "voice") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanVoice).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "store") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanStore).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else if (channel.type === "news") {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanNews).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            } else {
                channel.guild.member(executor.id).ban({
                    reason: `Suppression de Salon`
                }).then(channel.guild.owner.send(successfulBanUnkownChannel).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    })
                })
            }
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + channel.id + " (Channel ID)")}\n${grey("======================================")}\n`)
        }
    }
});

// Bot Banning
client.on("guildMemberAdd", async (member) => {

    const eventsTimestamp = Date.now().toString()

    const FetchingLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: "BOT_ADD",
    }).catch((err) => {
        return console.log(`${red("[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));

    const botAddLog = FetchingLogs.entries.first();

    if (!botAddLog) {
        return console.log(`${red(`[Erreur Fetch Log]: Ce type de log: 'BOT_ADD' n'a pas été vu avant l'event 'guildMemberAdd'.`)}`);
    } else {

        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + member.guild.name)}\n${green("[Event]: 'guildMemberAdd'")}\n${greenBright("[Type De Log]: 'BOT_ADD'")}`)

        const { executor, target, createdAt, createdTimestamp } = botAddLog;

        console.log(`${greenBright(`[Event Desc.]: [USER]: ${executor.tag} a invité un bot sur le serveur.`)}`);

        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        /**
        * Checks Whitelisted & Utilisateurs de Confiance Before banning
        */
        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');

        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        const successfulBan = new MessageEmbed()
            .setDescription(`**Ajout de Bot   Par:** ${executor.tag} \n**Bot:** ${target.tag} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const unsuccessfulBan = new MessageEmbed()
            .setDescription(`**Ajout de Bot   Par:** ${executor.tag} \n**Bot:** ${target.tag} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné.`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (Bot)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === member.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (target.bot) {
                member.guild.members.ban(executor.id, {
                    reason: `Ajout de Bot`
                }).then(member.guild.owner.send(successfulBan).catch((err) => {
                    return console.log(red("[Owner]: " + member.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(member.guild.members.ban(target.id, {
                    reason: "Ajout de Bot"
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                })).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${red("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + member.guild.owner.send(unsuccessfulBan).catch((err) => {
                        return console.log(red("[Owner]: " + member.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                });
            }
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (Bot)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === member.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (target.bot) {
                member.guild.members.ban(executor.id, {
                    reason: `Ajout de Bot`
                }).then(member.guild.owner.send(successfulBan))
                    .then(member.guild.members.ban(target.id, {
                        reason: "Ajout de Bot"
                    }).then(() => {
                        console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                    })).catch((err) => {
                        return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + member.guild.owner.send(unsuccessfulBan).catch((err) => {
                            return console.log(red("[Owner]: " + member.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                        });
                    });
            }
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (Bot)")}\n${grey("======================================")}\n`)
        }
    }

});

// Create Role
client.on("roleCreate", async (role) => {
    const eventsTimestamp = Date.now().toString()

    const FetchingLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: "ROLE_CREATE",
    }).catch((err) => {
        return console.log(`${red("[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));

    const roleCreateLogs = FetchingLogs.entries.first();

    if (!roleCreateLogs) {
        return console.log(`${red(`[Erreur Fetch Log]: Ce type de log: 'ROLE_CREATE' n'a pas été vu avant l'event 'roleCreate'.`)}`);
    } else {
        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + role.guild.name)}\n${green("[Event]: 'roleCreate'")}\n${greenBright("[Type De Log]: 'ROLE_CREATE'")}`)

        console.log(`${greenBright(`[Event Desc.]: [Role]: ${role.name} a été créé sur le serveur.`)}`);

        const { executor, createdAt, createdTimestamp } = roleCreateLogs;

        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        /**
        * Checks Whitelisted & Utilisateurs de Confiance Before banning
        */

        const successfulBan = new MessageEmbed()
            .setDescription(`**Création de Rôle   Par:** ${executor.tag}\n\n**Role:** ${role.name} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const unsuccessfulBan = new MessageEmbed()
            .setDescription(`**Création de Rôle   Par:** ${executor.tag}\n\n**Role:** ${role.name} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné.`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');

        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + role.name + " (Role)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === role.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            role.guild.members.ban(executor.id, {
                reason: `Création de Rôle`
            }).then(role.guild.owner.send(successfulBan).catch((err) => {
                return console.log(red("[Owner]: " + role.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
            }).then(() => {
                console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
            })).catch((err) => {
                return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + role.guild.owner.send(unsuccessfulBan).catch((err) => {
                    return console.log(red("[Owner]: " + role.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })
            });
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + role.name + " (Role)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === role.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            role.guild.members.ban(executor.id, {
                reason: `Création de Rôle`
            }).then(role.guild.owner.send(successfulBan).catch((err) => {
                return console.log(red("[Owner]: " + role.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
            }).then(() => {
                console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
            })).catch((err) => {
                return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + role.guild.owner.send(unsuccessfulBan).catch((err) => {
                    return console.log(red("[Owner]: " + role.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })
            });
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + role.name + " (Role)")}\n${grey("======================================")}\n`)
        }
    }

});

// Role Update
client.on("roleUpdate", async (oldRole, newRole) => {
    const eventsTimestamp = Date.now().toString()

    const FetchingLogs = await oldRole.guild.fetchAuditLogs({
        limit: 1,
        type: "ROLE_UPDATE",
    }).catch((err) => {
        return console.log(`${red("[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));

    const RoleUpdate = FetchingLogs.entries.first();

    if (!RoleUpdate) {
        return console.log(`${red(`[Erreur Fetch Log]: Ce type de log: 'ROLE_UPDATE' n'a pas été vu avant l'event 'roleUpdate'.`)}`);
    } else {
        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + oldRole.guild.name)}\n${green("[Event]: 'roleUpdate'")}\n${greenBright("[Type De Log]: 'ROLE_UPDATE'")}`)

        console.log(`${greenBright(`[Event Desc.]: [Role]: ${oldRole.name} a été modifié sur le serveur.`)}`);

        const { executor, createdAt, createdTimestamp } = RoleUpdate;

        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        /**
        * Checks Whitelisted & Utilisateurs de Confiance Before banning
        */

        const successfulAdminPermBan = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`ADMINISTRATOR\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban | Role Retiré.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulKickPermBan = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`KICK_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban | Role Retiré.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanPermBan = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`BAN_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban | Role Retiré.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulWebhookPermBan = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`MANAGE_WEBHOOKS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban | Role Retiré.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        //  Unsuccessful Embeds (Unable to ban executor)

        const unsuccessfulAdminPermBanExecutor = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`ADMINISTRATOR\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné Non Donné A l'**Executeur**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulKickPermBanExecutor = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`KICK_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné Non Donné A l'**Executeur**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulBanPermBanExecutor = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`BAN_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné Non Donné A l'**Executeur**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulWebhookPermBanExecutor = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`MANAGE_WEBHOOKS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné Non Donné A l'**Executeur**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        // Unsuccessful Embeds (Unable to delete role)

        const unsuccessfulAdminPermBanRole = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`ADMINISTRATOR\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné au **Role.**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulKickPermBanRole = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`KICK_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné au **Role.**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulBanPermBanRole = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`BAN_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné au **Role.**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulWebhookPermBanRole = new MessageEmbed()
            .setDescription(`**Modification de Rôle Par:** ${executor.tag}\n\n**Role:** ${oldRole.name} \n**Mis A Jour de Permissions:** \`MANAGE_WEBHOOKS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné au **Role.**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');

        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + oldRole.name + " (Role)")}`);
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === oldRole.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);

            if (!oldRole.permissions.has("ADMINISTRATOR") && newRole.permissions.has("ADMINISTRATOR")) {
                oldRole.guild.members.ban(executor.id, {
                    reason: `Modification de Rôle: permission ajoutée: Perm Admin.`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulAdminPermBanExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldRole.guild.owner.send(successfulAdminPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(newRole.delete(
                    "Modification de Rôle" // Reason
                ).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulAdminPermBanRole).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban | Role deleted")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldRole.permissions.has("BAN_MEMBERS") && newRole.permissions.has("BAN_MEMBERS")) {
                oldRole.guild.members.ban(executor.id, {
                    reason: `Modification de Rôle: permission ajoutée: Ban.`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulBanPermBanExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldRole.guild.owner.send(successfulBanPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(newRole.delete(
                    "Modification de Rôle" // Reason
                ).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulBanPermBanRole).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban | Role deleted")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldRole.permissions.has("KICK_MEMBERS") && newRole.permissions.has("KICK_MEMBERS")) {
                oldRole.guild.members.ban(executor.id, {
                    reason: `Modification de Rôle: permission ajoutée: Kick.`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulKickPermBanExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldRole.guild.owner.send(successfulKickPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(newRole.delete(
                    "Modification de Rôle" // Reason
                ).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulKickPermBanRole).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban | Role deleted")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldRole.permissions.has("MANAGE_WEBHOOKS") && newRole.permissions.has("MANAGE_WEBHOOKS")) {
                oldRole.guild.members.ban(executor.id, {
                    reason: `Modification de Rôle: permission ajoutée: Webhook`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulWebhookPermBanExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldRole.guild.owner.send(successfulWebhookPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(newRole.delete(
                    "Modification de Rôle" // Reason
                ).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulWebhookPermBanRole).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban | Role deleted")}\n${grey("======================================")}\n`)
                }))
            } else {
                return console.log(`${redBright("[ACTION]: NON AUTORISER MAIS NON TRAITER")}\n${grey("======================================")}\n`);
            }
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + oldRole.name + " (Role)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === oldRole.guild.owner.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (!oldRole.permissions.has("ADMINISTRATOR") && newRole.permissions.has("ADMINISTRATOR")) {
                oldRole.guild.members.ban(executor.id, {
                    reason: `Modification de Rôle: permission ajoutée: Admin.`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulAdminPermBanExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldRole.guild.owner.send(successfulAdminPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(newRole.delete(
                    "Modification de Rôle" // Reason
                ).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulAdminPermBanRole).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban | Role deleted")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldRole.permissions.has("BAN_MEMBERS") && newRole.permissions.has("BAN_MEMBERS")) {
                oldRole.guild.members.ban(executor.id, {
                    reason: `Modification de Rôle: permission ajoutée: Ban.`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulBanPermBanExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldRole.guild.owner.send(successfulBanPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(newRole.delete(
                    "Modification de Rôle" // Reason
                ).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulBanPermBanRole).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban | Role deleted")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldRole.permissions.has("KICK_MEMBERS") && newRole.permissions.has("KICK_MEMBERS")) {
                oldRole.guild.members.ban(executor.id, {
                    reason: `Modification de Rôle: permission ajoutée: Kick.`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulKickPermBanExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldRole.guild.owner.send(successfulKickPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(newRole.delete(
                    "Modification de Rôle" // Reason
                ).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulKickPermBanRole).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban | Role deleted")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldRole.permissions.has("MANAGE_WEBHOOKS") && newRole.permissions.has("MANAGE_WEBHOOKS")) {
                oldRole.guild.members.ban(executor.id, {
                    reason: `Modification de Rôle: permission ajoutée: Webhook.`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulWebhookPermBanExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldRole.guild.owner.send(successfulWebhookPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(newRole.delete(
                    "Modification de Rôle" // Reason
                ).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + oldRole.guild.owner.send(unsuccessfulWebhookPermBanRole).catch((err) => {
                        return console.log(red("[Owner]: " + oldRole.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban | Role deleted")}\n${grey("======================================")}\n`)
                }))
            } else {
                return console.log(`${redBright("[ACTION]: NON AUTORISER ET NON TRAITER")}\n${grey("======================================")}\n`);
            }
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + oldRole.name + " (Role)")}\n${grey("======================================")}\n`)
        }
    }

});

// When Member gets a new role or permission(s)
client.on("guildMemberUpdate", async (oldMember, newMember) => {

    const eventsTimestamp = Date.now().toString()

    const FetchingLogs = await oldMember.guild.fetchAuditLogs({
        limit: 1,
        type: "MEMBER_ROLE_UPDATE",
    }).catch((err) => {
        return console.log(`${red("[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));

    const MRU = FetchingLogs.entries.first();

    if (!MRU) {
        return console.log(`${red(`[Erreur Fetch Log]: Ce type de log: 'MEMBER_ROLE_UPDATE' n'a pas été vu avant l'event 'guildMemberUpdate'.`)}`);
    } else {

        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + newMember.guild.name)}\n${green("[Event]: 'guildMemberUpdate'")}\n${greenBright("[Type De Log]: 'MEMBER_ROLE_UPDATE'")}`)

        console.log(`${greenBright(`[Event Desc.]: [USER/BOT]: ${oldMember.user.tag} Roles, Permissions ou Pseudo a été changé dans le serveur.`)}`);

        const { executor, target, createdAt, createdTimestamp } = MRU;


        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        /**
        * Checks Whitelisted & Utilisateurs de Confiance Before banning
        */
        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');

        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        const successfulAdminPermBan = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`ADMINISTRATOR\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban | Executor & Membre.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulKickPermBan = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`KICK_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban | Executor & Membre.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulBanPermBan = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`BAN_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban | Executor & Membre.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const successfulWebhookPermBan = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`MANAGE_WEBHOOKS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban | Executor & Membre.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        // Unsuccessful Ban Executor

        const unsuccessfulBanAdminPermsExecutor = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`ADMINISTRATOR\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné à **Executor**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulBanWebhookPermsExecutor = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`MANAGE_WEBHOOKS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné à **Executor**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulBanPermsExecutor = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`BAN_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné à **Executor**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulBanKickPermsExecutor = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`KICK_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné à **Executor**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        // Unsuccessful Ban Membre

        const unsuccessfulBanAdminPermsMembre = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`ADMINISTRATOR\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné à **Membre.**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulBanWebhookPermsMembre = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`MANAGE_WEBHOOKS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné à **Membre.**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulBanPermsMembre = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`BAN_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné à **Membre.**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const unsuccessfulBanKickPermsMembre = new MessageEmbed()
            .setDescription(`**Modification de Membre Par:** ${executor.tag}\n\n**Membre** ${target.tag} \n**Mis A Jour de Permissions:** \`KICK_MEMBERS\` \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné à **Membre.**`)
            .setColor("RED")
            .setTimestamp(Date.now());

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (Bot/User)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === newMember.guild.ownerID) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);

            if (!oldMember.permissions.has("ADMINISTRATOR") && newMember.permissions.has("ADMINISTRATOR")) {
                oldMember.guild.members.ban(executor.id, {
                    reason: `Modification de membre`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanAdminPermsExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldMember.guild.owner.send(successfulAdminPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(oldMember.guild.members.ban(newMember.id, {
                    reason: "Permission Donnée: ADMINISTRATOR"
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanAdminPermsMembre).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldMember.permissions.has("KICK_MEMBERS") && newMember.permissions.has("KICK_MEMBERS")) {
                oldMember.guild.members.ban(executor.id, {
                    reason: `Modification de membre`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanKickPermsExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldMember.guild.owner.send(successfulKickPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(oldMember.guild.members.ban(newMember.id, {
                    reason: "Permission Donnée: KICK_MEMBERS"
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanKickPermsMembre).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldMember.permissions.has("BAN_MEMBERS") && newMember.permissions.has("BAN_MEMBERS")) {
                oldMember.guild.members.ban(executor.id, {
                    reason: `Modification de membre`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanPermsExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldMember.guild.owner.send(successfulBanPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(oldMember.guild.members.ban(newMember.id, {
                    reason: "Permission Donnée: BAN_MEMBERS"
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanPermsMembre).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldMember.permissions.has("MANAGE_WEBHOOKS") && newMember.permissions.has("MANAGE_WEBHOOKS")) {
                oldMember.guild.members.ban(executor.id, {
                    reason: `Modification de membre`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanWebhookPermsExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldMember.guild.owner.send(successfulWebhookPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(oldMember.guild.members.ban(newMember.id, {
                    reason: "Permission Donnée: MANAGE_WEBHOOKS"
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanWebhookPermsMembre).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                }))
            } else {
                return console.log(`${redBright("[ACTION]: NON AUTORISER MAIS NON TRAITER")}\n${grey("======================================")}\n`);
            }
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (Bot/User)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === newMember.guild.ownerID) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);

            if (!oldMember.permissions.has("ADMINISTRATOR") && newMember.permissions.has("ADMINISTRATOR")) {
                oldMember.guild.members.ban(executor.id, {
                    reason: `Modification de membre`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanAdminPermsExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldMember.guild.owner.send(successfulAdminPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(oldMember.guild.members.ban(newMember.id, {
                    reason: "Permission Donnée: ADMINISTRATOR"
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanAdminPermsMembre).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldMember.permissions.has("KICK_MEMBERS") && newMember.permissions.has("KICK_MEMBERS")) {
                oldMember.guild.members.ban(executor.id, {
                    reason: `Modification de membre`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanKickPermsExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldMember.guild.owner.send(successfulKickPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(oldMember.guild.members.ban(newMember.id, {
                    reason: "Permission Donnée: KICK_MEMBERS"
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanKickPermsMembre).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldMember.permissions.has("BAN_MEMBERS") && newMember.permissions.has("BAN_MEMBERS")) {
                oldMember.guild.members.ban(executor.id, {
                    reason: `Modification de membre`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanPermsExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldMember.guild.owner.send(successfulBanPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(oldMember.guild.members.ban(newMember.id, {
                    reason: "Permission Donnée: BAN_MEMBERS"
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanPermsMembre).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                }))
            } else if (!oldMember.permissions.has("MANAGE_WEBHOOKS") && newMember.permissions.has("MANAGE_WEBHOOKS")) {
                oldMember.guild.members.ban(executor.id, {
                    reason: `Modification de membre`
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanWebhookPermsExecutor).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(oldMember.guild.owner.send(successfulWebhookPermBan).catch((err) => {
                    return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                })).then(oldMember.guild.members.ban(newMember.id, {
                    reason: "Permission Donnée: MANAGE_WEBHOOKS"
                }).catch((err) => {
                    return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + newMember.guild.owner.send(unsuccessfulBanWebhookPermsMembre).catch((err) => {
                        return console.log(red("[Owner]: " + newMember.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                    });
                }).then(() => {
                    console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`)
                }))
            } else {
                return console.log(`${redBright("[ACTION]: NON AUTORISER MAIS NON TRAITER")}\n${grey("======================================")}\n`);
            }
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (Bot)")}\n${grey("======================================")}\n`)
        }
    }

});

// Webhook Create
client.on("webhookUpdate", async channel => {

    const eventsTimestamp = Date.now().toString()

    const FetchingLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: "WEBHOOK_CREATE"
    }).catch((err) => {
        return console.log(`${red("[Type De Log]: 'WEBHOOK_DELETE'\n[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));
    const WBU = FetchingLogs.entries.first();

    if (!WBU) {
        return console.log(`${red(`[Erreur Fetch Log]: Ce type de log: 'WEBHOOK_CREATE' n'a pas été vu avant l'event 'webhookUpdate'.`)}`);
    } else {
        const { executor, target, createdAt, createdTimestamp } = WBU;

        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + channel.guild.name)}\n${green("[Event]: 'webhookUpdate'")}\n${greenBright("[Type De Log]: 'WEBHOOK_CREATE'")}`)
        console.log(`${greenBright(`[Event Desc.]: [Webhook]: ${target.name} a été créé`)}`);

        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        /**
        * Checks Whitelisted & Utilisateurs de Confiance Before banning
        */
        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');

        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        // Unsuccessful Ban Executor

        const WebhookBan = new MessageEmbed()
            .setDescription(`**Webhook Créé Par:** ${executor.tag}\n\n**Nom Du Webhook:** ${target.name} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const WebhookBanError = new MessageEmbed()
            .setDescription(`**Webhook Créé Par:** ${executor.tag}\n\n**Nom Du Webhook:** ${target.name} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné.\n**Raison:** Permissions Manquantes.`)
            .setColor("RED")
            .setTimestamp(Date.now());

        // Unsuccessful Ban Membre

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.name + " (Webhook)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === channel.guild.ownerID) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            channel.guild.member(executor).ban({ reason: "Création de Webhook" }).catch((err) => {
                return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(WebhookBanError).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            }).then(() => {
                return console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`) + channel.guild.owner.send(WebhookBan).catch((err) => {
                    console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            })
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.name + " (Webhook)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === channel.guild.ownerID) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            channel.guild.member(executor).ban({ reason: "Création de Webhook" }).catch((err) => {
                return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(WebhookBanError).catch((err) => {
                    console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            }).then(() => {
                return console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`) + channel.guild.owner.send(WebhookBan).catch((err) => {
                    console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            })
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (Bot)")}\n${grey("======================================")}\n`)
        }
    }

});

// Webhook Delete
client.on("webhookUpdate", async channel => {
    const eventsTimestamp = Date.now().toString()

    const FetchingLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: "WEBHOOK_DELETE"
    }).catch((err) => {
        return console.log(`${red("[Type De Log]: 'WEBHOOK_DELETE'\n[Erreur De Log]: True")}\n${red("[Log Error Desc.]: " + err)}`)
    });

    if (!FetchingLogs) return console.log(red("[Erreur Entrées] Impossible de fetch les entrées."));

    const WBD = FetchingLogs.entries.first();

    if (!WBD) {
        return console.log(`${red(`[Erreur Fetch Log]: Ce type de log: 'WEBHOOK_DELETE' n'a pas été vu avant l'event 'webhookUpdate'.`)}`);
    } else {
        const { executor, target, createdAt, createdTimestamp } = WBD;

        console.log(`\n\n${grey("======================================")}\n${yellow("[!] Un Event a été trouvé.")}\n${yellowBright("[Serveur]: " + channel.guild.name)}\n${green("[Event]: 'webhookUpdate'")}\n${greenBright("[Type De Log]: 'WEBHOOK_DELETE'")}`)
        console.log(`${greenBright(`[Event Desc.]: [Webhook]: ${target.name} a été supprimé.`)}`);

        console.log(`${blue(`[Timestamp de Log]: ${createdTimestamp}`)}\n${blueBright(`[Timestamp d'Event]: ${eventsTimestamp}`)}`);

        /**
        * Checks Whitelisted & Utilisateurs de Confiance Before banning
        */
        const TrustedUserIDs = require('./commands/database/trustedUserIDs.json');
        const Acess = require('./commands/database/whitelist.json');

        const WhiteListedUser = Acess.find(el => el === `${executor.id}`)
        const Trusted = TrustedUserIDs.find((user) => user === `${executor.id}`);

        // Unsuccessful Ban Executor

        const WebhookBan = new MessageEmbed()
            .setDescription(`**Webhook Supprimé Par:** ${executor.tag}\n\n**Nom Du Webhook:** ${target.name} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Ban.`)
            .setColor(0x36393E)
            .setTimestamp(Date.now());

        const WebhookBanError = new MessageEmbed()
            .setDescription(`**Webhook Supprimé Par:** ${executor.tag}\n\n**Nom Du Webhook:** ${target.name} \n**Temps:** ${createdAt.toDateString()} \n**Sanction:** Non Donné.\n**Reason:** Permissions Manquantes.`)
            .setColor("RED")
            .setTimestamp(Date.now());

        // Unsuccessful Ban Membre

        const LogTimeString = createdTimestamp.toString();
        const EventExecution = eventsTimestamp;

        const logtime = LogTimeString.slice(0, -3);
        const eventtime = EventExecution.slice(0, -3);

        const logtime2 = LogTimeString.slice(0, -4);
        const eventtime2 = EventExecution.slice(0, -4);

        if (logtime === eventtime) {
            console.log(`${grey(`[Event Valider #1]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.name + " (Webhook)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === channel.guild.ownerID) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            channel.guild.member(executor).ban({ reason: "Suppression de Webhook" }).catch((err) => {
                return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(WebhookBanError).catch((err) => {
                    return console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            }).then(() => {
                return console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`) + channel.guild.owner.send(WebhookBan).catch((err) => {
                    console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            })
        } else if (logtime2 === eventtime2) {
            console.log(`${grey(`[Event Valider #2]: True`)}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.name + " (Webhook)")}`)
            if (executor.id === client.user.id) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === channel.guild.ownerID) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            if (executor.id === WhiteListedUser || Trusted) return console.log(`${magentaBright(`[TYPE ACTION]: AUTORISER`)}\n${grey("======================================")}\n`);
            channel.guild.member(executor).ban({ reason: "Suppression de Webhook" }).catch((err) => {
                return console.log(`${redBright("[Essaie]: False")}\n${red("[Sanction]: Aucune Sanction Donnée")}\n${magentaBright("[Erreur de Sanction]: " + err)}\n${grey("======================================")}\n`) + channel.guild.owner.send(WebhookBanError).catch((err) => {
                    console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            }).then(() => {
                return console.log(`${redBright("[Essaie]: True")}\n${red("[Sentence]: Ban")}\n${grey("======================================")}\n`) + channel.guild.owner.send(WebhookBan).catch((err) => {
                    console.log(red("[Owner]: " + channel.guild.owner.user.tag + " ne peut pas être dm. [Message Error Desc.]: " + err));
                });
            })
        } else {
            return console.log(`${grey(`[Event Valider]: False`)}\n${magenta("[Raison]: Event trouvé mais la timestamp ne correspond pas.")}\n${cyan("[Executeur]: " + executor.tag)}\n${cyanBright("[Membree]: " + target.tag + " (Bot)")}\n${grey("======================================")}\n`)
        }
    }
});


client.login(token);
