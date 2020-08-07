const EventEmitter = require('events');
const ValidationError = require('../errors/validation');

module.exports = class ResearchService extends EventEmitter {

    constructor(technologyService, randomService, playerService, userService) {
        super();
        
        this.technologyService = technologyService;
        this.randomService = randomService;
        this.playerService = playerService;
        this.userService = userService;
    }

    async updateResearchNow(game, player, preference) {
        if (!this.technologyService.isTechnologyEnabled(game, preference)) {
            throw new ValidationError(`Cannot change technology, the chosen tech is not researchable.`);
        }

        player.researchingNow = preference;

        await game.save();

        let ticksEta = this.calculateCurrentResearchETAInTicks(game, player);
        
        return {
            ticksEta
        };
    }

    async updateResearchNext(game, player, preference) {
        if (!this.technologyService.isTechnologyEnabled(game, preference)) {
            throw new ValidationError(`Cannot change technology, the chosen tech is not researchable.`);
        }

        player.researchingNext = preference;

        return await game.save();
    }

    async conductResearch(game, player) {
        // TODO: Defeated players do not conduct research or experiments?
        if (player.defeated) {
            return;
        }
        
        let user = await this.userService.getById(player.userId);

        let techKey = player.researchingNow;
        let tech = player.research[techKey];

        let totalScience = this.playerService.calculateTotalScience(player, game.galaxy.stars);
            
        tech.progress += totalScience;
        user.achievements.research[techKey] += totalScience;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, techKey, tech.level);

        let levelUpTech = null;

        if (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;

            levelUpTech = {
                name: techKey,
                level: tech.level
            };

            this.emit('onPlayerResearchCompleted', {
                game,
                player,
                technology: levelUpTech
            });

            player.researchingNow = player.researchingNext;
        }

        await user.save();

        return levelUpTech;
    }

    getRequiredResearchProgress(game, technologyKey, technologyLevel) {
        const researchCostConfig = game.settings.technology.researchCosts[technologyKey];
        const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig];
        const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier;

        return technologyLevel * progressMultiplierConfig;
    }

    async conductExperiments(game, player) {
        // TODO: Defeated players do not conduct research or experiments?
        if (player.defeated) {
            return;
        }

        let techs = Object.keys(player.research).filter(k => {
            return k.match(/^[^_\$]/) != null;
        });

        techs = techs.filter(t => this.technologyService.isTechnologyEnabled(game, t));

        if (!techs.length) {
            return;
        }

        let user = await this.userService.getById(player.userId);

        let researchTechsCount = techs.length;

        let techKey = techs[this.randomService.getRandomNumber(researchTechsCount - 1)];
        let tech = player.research[techKey];
        let researchAmount = player.research.experimentation.level * game.constants.research.progressMultiplier;

        tech.progress += researchAmount;
        user.achievements.research[techKey] += researchAmount;

        // If the current progress is greater than the required progress
        // then increase the level and carry over the remainder.
        let requiredProgress = this.getRequiredResearchProgress(game, techKey, tech.level);

        while (tech.progress >= requiredProgress) {
            tech.level++;
            tech.progress -= requiredProgress;
        }

        await user.save();

        return {
            technology: techKey,
            level: tech.level,
            amount: researchAmount
        };
    }

    calculateCurrentResearchETAInTicks(game, player) {
        let tech = player.research[player.researchingNow];
        
        let requiredProgress = this.getRequiredResearchProgress(game, player.researchingNow, tech.level);
        let remainingPoints = requiredProgress - tech.progress;

        let totalScience = this.playerService.calculateTotalScience(player, game.galaxy.stars);

        // If there is no science then there cannot be an end date to the research.
        if (totalScience === 0) {
            return null;
        }

        return Math.ceil(remainingPoints / totalScience);
    }

};
