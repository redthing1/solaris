const CombatService = require('../services/combat');

const fakeTechnologyService = {
    getStarEffectiveWeaponsLevel(game, defender, star, defenderCarriers) {
        return 1;
    },
    getCarriersEffectiveWeaponsLevel(game, attackers, attackerCarriers, isCarrierToStarCombat) {
        return 1;
    },
    getCarriersWeaponsDebuff(carriers) {
        return 0;
    }
};

const fakeSpecialistService = {

};

const fakePlayerService = {

};

const fakeStarService = {

};

const fakeReputationService = {

};

const fakeDiplomacyService = {

};

describe('combat', () => {

    const service = new CombatService(fakeTechnologyService, fakeSpecialistService, fakePlayerService, fakeStarService, fakeReputationService, fakeDiplomacyService);

    it('should calculate basic combat', async () => {
        const defender = {
            ships: 10,
            weaponsLevel: 1
        };

        const attacker = {
            ships: 20,
            weaponsLevel: 1
        };

        const isTurnBased = false;
        const calculatedNeeded = false;

        const combatResult = service.calculate(defender, attacker, isTurnBased, calculatedNeeded);

        expect(combatResult.weapons.defender).toBe(defender.weaponsLevel);
        expect(combatResult.weapons.attacker).toBe(attacker.weaponsLevel);
        expect(combatResult.before.defender).toBe(defender.ships);
        expect(combatResult.before.attacker).toBe(attacker.ships);
        expect(combatResult.after.defender).toBe(0);
        expect(combatResult.after.attacker).toBe(10);
        expect(combatResult.lost.defender).toBe(10);
        expect(combatResult.lost.attacker).toBe(10);
    });

    it('should calculate basic turn based combat - attacker wins', async () => {
        const defender = {
            ships: 10,
            weaponsLevel: 1
        };

        const attacker = {
            ships: 20,
            weaponsLevel: 1
        };

        const isTurnBased = true;
        const calculatedNeeded = false;

        const combatResult = service.calculate(defender, attacker, isTurnBased, calculatedNeeded);

        expect(combatResult.weapons.defender).toBe(defender.weaponsLevel);
        expect(combatResult.weapons.attacker).toBe(attacker.weaponsLevel);
        expect(combatResult.before.defender).toBe(defender.ships);
        expect(combatResult.before.attacker).toBe(attacker.ships);
        expect(combatResult.after.defender).toBe(0);
        expect(combatResult.after.attacker).toBe(10);
        expect(combatResult.lost.defender).toBe(10);
        expect(combatResult.lost.attacker).toBe(10);
    });
    
    it('should calculate basic turn based combat - defender wins', async () => {
        const defender = {
            ships: 20,
            weaponsLevel: 1
        };

        const attacker = {
            ships: 10,
            weaponsLevel: 1
        };

        const isTurnBased = true;
        const calculatedNeeded = false;

        const combatResult = service.calculate(defender, attacker, isTurnBased, calculatedNeeded);

        expect(combatResult.weapons.defender).toBe(defender.weaponsLevel);
        expect(combatResult.weapons.attacker).toBe(attacker.weaponsLevel);
        expect(combatResult.before.defender).toBe(defender.ships);
        expect(combatResult.before.attacker).toBe(attacker.ships);
        expect(combatResult.after.defender).toBe(11);
        expect(combatResult.after.attacker).toBe(0);
        expect(combatResult.lost.defender).toBe(9);
        expect(combatResult.lost.attacker).toBe(10);
    });

    // --------------------------

    it('should calculate carrier to star combat - carriers vs. star garrison - defender wins', async () => {
        const game = { };

        const star = {
            shipsActual: 10
        };

        const owner = { };

        const defenders = [];

        const attackers = [];

        const defenderCarriers = [];
        
        const attackerCarriers = [
            {
                ships: 3
            },
            {
                ships: 7
            }
        ];

        const combatResult = service.calculateStar(game, star, owner, defenders, attackers, defenderCarriers, attackerCarriers);

        expect(combatResult.weapons.defender).toBe(1);
        expect(combatResult.weapons.attacker).toBe(1);
        expect(combatResult.before.defender).toBe(10);
        expect(combatResult.before.attacker).toBe(10);
        expect(combatResult.after.defender).toBe(1);
        expect(combatResult.after.attacker).toBe(0);
        expect(combatResult.lost.defender).toBe(9);
        expect(combatResult.lost.attacker).toBe(10);
    });

    it('should calculate carrier to star combat - carriers vs. star garrison - attacker wins', async () => {
        const game = { };

        const star = {
            shipsActual: 10
        };

        const owner = { };

        const defenders = [];

        const attackers = [];

        const defenderCarriers = [];
        
        const attackerCarriers = [
            {
                ships: 30
            },
            {
                ships: 70
            }
        ];

        const combatResult = service.calculateStar(game, star, owner, defenders, attackers, defenderCarriers, attackerCarriers);

        expect(combatResult.weapons.defender).toBe(1);
        expect(combatResult.weapons.attacker).toBe(1);
        expect(combatResult.before.defender).toBe(10);
        expect(combatResult.before.attacker).toBe(100);
        expect(combatResult.after.defender).toBe(0);
        expect(combatResult.after.attacker).toBe(90);
        expect(combatResult.lost.defender).toBe(10);
        expect(combatResult.lost.attacker).toBe(10);
    });

    it('should calculate carrier to star combat - carriers vs. carriers - defender wins', async () => {
        const game = { };

        const star = {
            shipsActual: 0
        };

        const owner = { };

        const defenders = [];

        const attackers = [];

        const defenderCarriers = [
            {
                ships: 10
            }
        ];
        
        const attackerCarriers = [
            {
                ships: 3
            },
            {
                ships: 7
            }
        ];

        const combatResult = service.calculateStar(game, star, owner, defenders, attackers, defenderCarriers, attackerCarriers);

        expect(combatResult.weapons.defender).toBe(1);
        expect(combatResult.weapons.attacker).toBe(1);
        expect(combatResult.before.defender).toBe(10);
        expect(combatResult.before.attacker).toBe(10);
        expect(combatResult.after.defender).toBe(1);
        expect(combatResult.after.attacker).toBe(0);
        expect(combatResult.lost.defender).toBe(9);
        expect(combatResult.lost.attacker).toBe(10);
    });

    it('should calculate carrier to star combat - carriers vs. carriers - attacker wins', async () => {
        const game = { };

        const star = {
            shipsActual: 0
        };

        const owner = { };

        const defenders = [];

        const attackers = [];

        const defenderCarriers = [
            {
                ships: 10
            }
        ];
        
        const attackerCarriers = [
            {
                ships: 30
            },
            {
                ships: 70
            }
        ];

        const combatResult = service.calculateStar(game, star, owner, defenders, attackers, defenderCarriers, attackerCarriers);

        expect(combatResult.weapons.defender).toBe(1);
        expect(combatResult.weapons.attacker).toBe(1);
        expect(combatResult.before.defender).toBe(10);
        expect(combatResult.before.attacker).toBe(100);
        expect(combatResult.after.defender).toBe(0);
        expect(combatResult.after.attacker).toBe(90);
        expect(combatResult.lost.defender).toBe(10);
        expect(combatResult.lost.attacker).toBe(10);
    });

    // --------------------------

    it('should calculate carrier to carrier combat - mutual destruction', async () => {
        const game = { };

        const defenders = [];

        const attackers = [];

        const defenderCarriers = [
            {
                ships: 10
            }
        ];
        
        const attackerCarriers = [
            {
                ships: 3
            },
            {
                ships: 7
            }
        ];

        const combatResult = service.calculateCarrier(game, defenders, attackers, defenderCarriers, attackerCarriers);

        expect(combatResult.weapons.defender).toBe(1);
        expect(combatResult.weapons.attacker).toBe(1);
        expect(combatResult.before.defender).toBe(10);
        expect(combatResult.before.attacker).toBe(10);
        expect(combatResult.after.defender).toBe(0);
        expect(combatResult.after.attacker).toBe(0);
        expect(combatResult.lost.defender).toBe(10);
        expect(combatResult.lost.attacker).toBe(10);
    });

    it('should calculate carrier to carrier combat - defender wins', async () => {
        const game = { };

        const defenders = [];

        const attackers = [];

        const defenderCarriers = [
            {
                ships: 100
            }
        ];
        
        const attackerCarriers = [
            {
                ships: 3
            },
            {
                ships: 7
            }
        ];

        const combatResult = service.calculateCarrier(game, defenders, attackers, defenderCarriers, attackerCarriers);

        expect(combatResult.weapons.defender).toBe(1);
        expect(combatResult.weapons.attacker).toBe(1);
        expect(combatResult.before.defender).toBe(100);
        expect(combatResult.before.attacker).toBe(10);
        expect(combatResult.after.defender).toBe(90);
        expect(combatResult.after.attacker).toBe(0);
        expect(combatResult.lost.defender).toBe(10);
        expect(combatResult.lost.attacker).toBe(10);
    });

    it('should calculate carrier to carrier combat - attacker wins', async () => {
        const game = { };

        const defenders = [];

        const attackers = [];

        const defenderCarriers = [
            {
                ships: 10
            }
        ];
        
        const attackerCarriers = [
            {
                ships: 30
            },
            {
                ships: 70
            }
        ];

        const combatResult = service.calculateCarrier(game, defenders, attackers, defenderCarriers, attackerCarriers);

        expect(combatResult.weapons.defender).toBe(1);
        expect(combatResult.weapons.attacker).toBe(1);
        expect(combatResult.before.defender).toBe(10);
        expect(combatResult.before.attacker).toBe(100);
        expect(combatResult.after.defender).toBe(0);
        expect(combatResult.after.attacker).toBe(90);
        expect(combatResult.lost.defender).toBe(10);
        expect(combatResult.lost.attacker).toBe(10);
    });

});