export default class NpcHelper {

    static createNpc(scene, id, x, y, npcScale = 2, key, depth = 10, animKey = null) {

        let npc;

        npc = scene.add.sprite(x, y, key).setDepth(depth);
        npc.play(animKey);


        npc.setScale(2);
        npc.animKey = animKey;
        npc.baseKey = key;
        npc.baseAnimKey = animKey;
        npc.setInteractive({ useHandCursor: true });
        npc.id = id;
        npc.proximityDistance = 300;

        return npc;
    }

    static createNpcItem(scene, id, x, y, npcScale = 2, key, glowKey = null, depth = 10,) {

        let npcItem;

        npcItem = scene.add.image(x, y, key).setDepth(depth);

        npcItem.setScale(npcScale);
        npcItem.baseKey = key;
        npcItem.glowKey = glowKey ?? `${key}_glow`;
        npcItem.isGlow = false;

        npcItem.setInteractive({ useHandCursor: true });
        npcItem.id = id;
        npcItem.proximityDistance = 300;

        return npcItem;
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