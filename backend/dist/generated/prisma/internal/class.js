"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.9.0",
    "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider     = \"prisma-client\"\n  output       = \"../generated/prisma\"\n  moduleFormat = \"cjs\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\n// No User model. `ownerId` is the Auth0 `sub` claim, taken directly off the\n// already-verified JWT (see AuthGuard) — there's no local profile data\n// (name, email, prefs) to justify syncing users into this DB yet. See the\n// chat response for the full reasoning and the trigger for revisiting this.\n\nmodel Collection {\n  id         String     @id @default(cuid())\n  name       String\n  ownerId    String\n  // Null = not shared. A 256-bit random token (see CollectionsService),\n  // never derived from id/ownerId, so it can't be guessed even by someone\n  // who knows the collection's id.\n  shareToken String?    @unique\n  createdAt  DateTime   @default(now())\n  updatedAt  DateTime   @updatedAt\n  bookmarks  Bookmark[]\n\n  @@index([ownerId])\n}\n\nmodel Bookmark {\n  id           String      @id @default(cuid())\n  url          String\n  title        String\n  notes        String?\n  ownerId      String\n  collectionId String?\n  createdAt    DateTime    @default(now())\n  updatedAt    DateTime    @updatedAt\n  collection   Collection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)\n\n  @@index([ownerId])\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"Collection\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ownerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"shareToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"bookmarks\",\"kind\":\"object\",\"type\":\"Bookmark\",\"relationName\":\"BookmarkToCollection\"}],\"dbName\":null},\"Bookmark\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"url\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ownerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"collectionId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"collection\",\"kind\":\"object\",\"type\":\"Collection\",\"relationName\":\"BookmarkToCollection\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"orderBy\",\"cursor\",\"collection\",\"bookmarks\",\"_count\",\"Collection.findUnique\",\"Collection.findUniqueOrThrow\",\"Collection.findFirst\",\"Collection.findFirstOrThrow\",\"Collection.findMany\",\"data\",\"Collection.createOne\",\"Collection.createMany\",\"Collection.createManyAndReturn\",\"Collection.updateOne\",\"Collection.updateMany\",\"Collection.updateManyAndReturn\",\"create\",\"update\",\"Collection.upsertOne\",\"Collection.deleteOne\",\"Collection.deleteMany\",\"having\",\"_min\",\"_max\",\"Collection.groupBy\",\"Collection.aggregate\",\"Bookmark.findUnique\",\"Bookmark.findUniqueOrThrow\",\"Bookmark.findFirst\",\"Bookmark.findFirstOrThrow\",\"Bookmark.findMany\",\"Bookmark.createOne\",\"Bookmark.createMany\",\"Bookmark.createManyAndReturn\",\"Bookmark.updateOne\",\"Bookmark.updateMany\",\"Bookmark.updateManyAndReturn\",\"Bookmark.upsertOne\",\"Bookmark.deleteOne\",\"Bookmark.deleteMany\",\"Bookmark.groupBy\",\"Bookmark.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"url\",\"title\",\"notes\",\"ownerId\",\"collectionId\",\"createdAt\",\"updatedAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"name\",\"shareToken\",\"every\",\"some\",\"none\",\"is\",\"isNot\",\"connectOrCreate\",\"upsert\",\"createMany\",\"set\",\"disconnect\",\"delete\",\"connect\",\"updateMany\",\"deleteMany\"]"),
    graph: "bRIgCgQAAEkAICwAAEUAMC0AAAcAEC4AAEUAMC8BAAAAATMBAEYAITVAAEgAITZAAEgAIUIBAEYAIUMBAAAAAQEAAAABACAMAwAASwAgLAAASgAwLQAAAwAQLgAASgAwLwEARgAhMAEARgAhMQEARgAhMgEARwAhMwEARgAhNAEARwAhNUAASAAhNkAASAAhAwMAAGcAIDIAAEwAIDQAAEwAIAwDAABLACAsAABKADAtAAADABAuAABKADAvAQAAAAEwAQBGACExAQBGACEyAQBHACEzAQBGACE0AQBHACE1QABIACE2QABIACEDAAAAAwAgAQAABAAwAgAABQAgCgQAAEkAICwAAEUAMC0AAAcAEC4AAEUAMC8BAEYAITMBAEYAITVAAEgAITZAAEgAIUIBAEYAIUMBAEcAIQEAAAAHACABAAAAAwAgAQAAAAEAIAIEAABmACBDAABMACADAAAABwAgAQAACwAwAgAAAQAgAwAAAAcAIAEAAAsAMAIAAAEAIAMAAAAHACABAAALADACAAABACAHBAAAZQAgLwEAAAABMwEAAAABNUAAAAABNkAAAAABQgEAAAABQwEAAAABAQsAAA8AIAYvAQAAAAEzAQAAAAE1QAAAAAE2QAAAAAFCAQAAAAFDAQAAAAEBCwAAEQAwAQsAABEAMAcEAABYACAvAQBQACEzAQBQACE1QABSACE2QABSACFCAQBQACFDAQBRACECAAAAAQAgCwAAFAAgBi8BAFAAITMBAFAAITVAAFIAITZAAFIAIUIBAFAAIUMBAFEAIQIAAAAHACALAAAWACACAAAABwAgCwAAFgAgAwAAAAEAIBIAAA8AIBMAABQAIAEAAAABACABAAAABwAgBAUAAFUAIBgAAFcAIBkAAFYAIEMAAEwAIAksAABEADAtAAAdABAuAABEADAvAQA5ACEzAQA5ACE1QAA7ACE2QAA7ACFCAQA5ACFDAQA6ACEDAAAABwAgAQAAHAAwFwAAHQAgAwAAAAcAIAEAAAsAMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQMAAFQAIC8BAAAAATABAAAAATEBAAAAATIBAAAAATMBAAAAATQBAAAAATVAAAAAATZAAAAAAQELAAAlACAILwEAAAABMAEAAAABMQEAAAABMgEAAAABMwEAAAABNAEAAAABNUAAAAABNkAAAAABAQsAACcAMAELAAAnADABAAAABwAgCQMAAFMAIC8BAFAAITABAFAAITEBAFAAITIBAFEAITMBAFAAITQBAFEAITVAAFIAITZAAFIAIQIAAAAFACALAAArACAILwEAUAAhMAEAUAAhMQEAUAAhMgEAUQAhMwEAUAAhNAEAUQAhNUAAUgAhNkAAUgAhAgAAAAMAIAsAAC0AIAIAAAADACALAAAtACABAAAABwAgAwAAAAUAIBIAACUAIBMAACsAIAEAAAAFACABAAAAAwAgBQUAAE0AIBgAAE8AIBkAAE4AIDIAAEwAIDQAAEwAIAssAAA4ADAtAAA1ABAuAAA4ADAvAQA5ACEwAQA5ACExAQA5ACEyAQA6ACEzAQA5ACE0AQA6ACE1QAA7ACE2QAA7ACEDAAAAAwAgAQAANAAwFwAANQAgAwAAAAMAIAEAAAQAMAIAAAUAIAssAAA4ADAtAAA1ABAuAAA4ADAvAQA5ACEwAQA5ACExAQA5ACEyAQA6ACEzAQA5ACE0AQA6ACE1QAA7ACE2QAA7ACEOBQAAPQAgGAAAQwAgGQAAQwAgNwEAAAABOAEAAAAEOQEAAAAEOgEAAAABOwEAAAABPAEAAAABPQEAAAABPgEAQgAhPwEAAAABQAEAAAABQQEAAAABDgUAAEAAIBgAAEEAIBkAAEEAIDcBAAAAATgBAAAABTkBAAAABToBAAAAATsBAAAAATwBAAAAAT0BAAAAAT4BAD8AIT8BAAAAAUABAAAAAUEBAAAAAQsFAAA9ACAYAAA-ACAZAAA-ACA3QAAAAAE4QAAAAAQ5QAAAAAQ6QAAAAAE7QAAAAAE8QAAAAAE9QAAAAAE-QAA8ACELBQAAPQAgGAAAPgAgGQAAPgAgN0AAAAABOEAAAAAEOUAAAAAEOkAAAAABO0AAAAABPEAAAAABPUAAAAABPkAAPAAhCDcCAAAAATgCAAAABDkCAAAABDoCAAAAATsCAAAAATwCAAAAAT0CAAAAAT4CAD0AIQg3QAAAAAE4QAAAAAQ5QAAAAAQ6QAAAAAE7QAAAAAE8QAAAAAE9QAAAAAE-QAA-ACEOBQAAQAAgGAAAQQAgGQAAQQAgNwEAAAABOAEAAAAFOQEAAAAFOgEAAAABOwEAAAABPAEAAAABPQEAAAABPgEAPwAhPwEAAAABQAEAAAABQQEAAAABCDcCAAAAATgCAAAABTkCAAAABToCAAAAATsCAAAAATwCAAAAAT0CAAAAAT4CAEAAIQs3AQAAAAE4AQAAAAU5AQAAAAU6AQAAAAE7AQAAAAE8AQAAAAE9AQAAAAE-AQBBACE_AQAAAAFAAQAAAAFBAQAAAAEOBQAAPQAgGAAAQwAgGQAAQwAgNwEAAAABOAEAAAAEOQEAAAAEOgEAAAABOwEAAAABPAEAAAABPQEAAAABPgEAQgAhPwEAAAABQAEAAAABQQEAAAABCzcBAAAAATgBAAAABDkBAAAABDoBAAAAATsBAAAAATwBAAAAAT0BAAAAAT4BAEMAIT8BAAAAAUABAAAAAUEBAAAAAQksAABEADAtAAAdABAuAABEADAvAQA5ACEzAQA5ACE1QAA7ACE2QAA7ACFCAQA5ACFDAQA6ACEKBAAASQAgLAAARQAwLQAABwAQLgAARQAwLwEARgAhMwEARgAhNUAASAAhNkAASAAhQgEARgAhQwEARwAhCzcBAAAAATgBAAAABDkBAAAABDoBAAAAATsBAAAAATwBAAAAAT0BAAAAAT4BAEMAIT8BAAAAAUABAAAAAUEBAAAAAQs3AQAAAAE4AQAAAAU5AQAAAAU6AQAAAAE7AQAAAAE8AQAAAAE9AQAAAAE-AQBBACE_AQAAAAFAAQAAAAFBAQAAAAEIN0AAAAABOEAAAAAEOUAAAAAEOkAAAAABO0AAAAABPEAAAAABPUAAAAABPkAAPgAhA0QAAAMAIEUAAAMAIEYAAAMAIAwDAABLACAsAABKADAtAAADABAuAABKADAvAQBGACEwAQBGACExAQBGACEyAQBHACEzAQBGACE0AQBHACE1QABIACE2QABIACEMBAAASQAgLAAARQAwLQAABwAQLgAARQAwLwEARgAhMwEARgAhNUAASAAhNkAASAAhQgEARgAhQwEARwAhRwAABwAgSAAABwAgAAAAAAFMAQAAAAEBTAEAAAABAUxAAAAAAQcSAABpACATAABsACBJAABqACBKAABrACBNAAAHACBOAAAHACBPAAABACADEgAAaQAgSQAAagAgTwAAAQAgAAAACxIAAFkAMBMAAF4AMEkAAFoAMEoAAFsAMEsAAFwAIEwAAF0AME0AAF0AME4AAF0AME8AAF0AMFAAAF8AMFEAAGAAMAcvAQAAAAEwAQAAAAExAQAAAAEyAQAAAAEzAQAAAAE1QAAAAAE2QAAAAAECAAAABQAgEgAAZAAgAwAAAAUAIBIAAGQAIBMAAGMAIAELAABoADAMAwAASwAgLAAASgAwLQAAAwAQLgAASgAwLwEAAAABMAEARgAhMQEARgAhMgEARwAhMwEARgAhNAEARwAhNUAASAAhNkAASAAhAgAAAAUAIAsAAGMAIAIAAABhACALAABiACALLAAAYAAwLQAAYQAQLgAAYAAwLwEARgAhMAEARgAhMQEARgAhMgEARwAhMwEARgAhNAEARwAhNUAASAAhNkAASAAhCywAAGAAMC0AAGEAEC4AAGAAMC8BAEYAITABAEYAITEBAEYAITIBAEcAITMBAEYAITQBAEcAITVAAEgAITZAAEgAIQcvAQBQACEwAQBQACExAQBQACEyAQBRACEzAQBQACE1QABSACE2QABSACEHLwEAUAAhMAEAUAAhMQEAUAAhMgEAUQAhMwEAUAAhNUAAUgAhNkAAUgAhBy8BAAAAATABAAAAATEBAAAAATIBAAAAATMBAAAAATVAAAAAATZAAAAAAQQSAABZADBJAABaADBLAABcACBPAABdADAAAgQAAGYAIEMAAEwAIAcvAQAAAAEwAQAAAAExAQAAAAEyAQAAAAEzAQAAAAE1QAAAAAE2QAAAAAEGLwEAAAABMwEAAAABNUAAAAABNkAAAAABQgEAAAABQwEAAAABAgAAAAEAIBIAAGkAIAMAAAAHACASAABpACATAABtACAIAAAABwAgCwAAbQAgLwEAUAAhMwEAUAAhNUAAUgAhNkAAUgAhQgEAUAAhQwEAUQAhBi8BAFAAITMBAFAAITVAAFIAITZAAFIAIUIBAFAAIUMBAFEAIQIEBgIFAAMBAwgBAQQJAAAAAAMFAAgYAAkZAAoAAAADBQAIGAAJGQAKAQMqAQEDMAEDBQAPGAAQGQARAAAAAwUADxgAEBkAEQYCAQcKAQgMAQkNAQoOAQwQAQ0SBA4TBQ8VARAXBBEYBhQZARUaARYbBBoeBxsfCxwgAh0hAh4iAh8jAiAkAiEmAiIoBCMpDCQsAiUuBCYvDScxAigyAikzBCo2Dis3Eg"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.js"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map