import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('my-fancy-schematic', () => {
    it('works', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);
        const tree = await runner.runSchematic('my-fancy-schematic', {}, Tree.empty());

        expect(tree.files).toEqual([]);
    });
});
