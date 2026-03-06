export default class NpcHelper {

    static createNpc(scene, id, x, y, npcScale = 2, key, bubbles, depth = 10, animKey = null) {

        let npc;

        npc = scene.add.sprite(x, y, key).setDepth(depth);
        npc.play(animKey);


        npc.setScale(2);
        npc.animKey = animKey;
        npc.baseKey = key;
        npc.baseAnimKey = animKey;
        npc.glowKey = `${key}_glow`;
        npc.glowAnimKey = `${key}_glow_anim`;
        npc.isGlow = false;
        npc.bubbles = bubbles;
        npc.setInteractive({ useHandCursor: true });
        npc.id = id;
        npc.proximityDistance = 300;

        return npc;
    }

    static createCharacter(scene, x, y, npcScale = 1,
        spriteKey, depth = 10, animKey = null) {

        // Use sprite instead of video for NPC
        let character = scene.add.sprite(x, y, spriteKey).setDepth(depth);
        character.setScale(npcScale);
        character.play(animKey);
        character.spriteKey = spriteKey;
        return character;
    }

}