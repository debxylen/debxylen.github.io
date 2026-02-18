import posts from './posts.json';

export const NAV_ITEMS = ["about", "projects", "stack", "log", "links"];

export const HERO_CONTENT = {
    tagline: "i'm not perfect so i'll build something that is.",
};

export const ABOUT_CONTENT = {
    paragraph: "harrow eberrynyan. i'm xylen. \naverage internet dude. i do code, game dev, blender, editing, and a ton of random projects cuz why not. into visuals, cars, space tech, computers, anime & manhua, some games, etc",
    sideNotes: [
        "// a jerk of all trades",
        "// a jack of some.",
    ],
    location: "the internet",
    status: "alive",
};

export const TRAITS = [
    "chronically online",
    "programmer",
    "solana dev",
    "creatives",
    "weeaboo",
];

export const PROJECTS = [
    {
        name: "Xylume TestNet",
        desc: "next-gen L1 protocol. high throughput, extreme efficiency.",
        details: "evm-compatible decentralized layer 1 platform focusing on throughput, scalability, and low-cost sub-second transactions.",
        tags: ["blockchain", "layer1"],
        status: "rewriting",
    },
    {
        name: "Lunara",
        desc: "zk-privacy layer1",
        details: "novel zk stack for complete trustless privacy, focusing on performance, latency, and cost-efficiency.",
        tags: ["zk", "layer1", "privacy"],
        status: "finishing up",
    },
    {
        name: "gurtbot",
        desc: "utility-driven swiss-army-knife discord bot with a personality.",
        details: "power-user utility commands, moderation suite, and our beloved gurt. serves 10+ servers (9 are my alts).",
        tags: ["discord", "bot", "ai"],
        status: "active",
    },
    {
        name: "Solus",
        desc: "zero-fee token launchpad & dex on Solana.",
        details: "lowest-cost launchpad with zero protocol fees. focusing on tooling, innovation, devex and UX.",
        tags: ["solana", "dex", "launchpad", "defi"],
        status: "finished",
    },
    {
        name: "Obsidian Client",
        desc: "heavily optimized unofficial ChatGPT client.",
        details: "chatgpt.com, done properly.",
        tags: ["ai", "webdev", "reverse engineering apis"],
        status: "dormant",
    },
];

export const STACK = {
    languages: ["C", "Python", "Solidity", "Lua"],
    focus: ["efficiency", "optimization", "pragmatic design"],
    interests: ["ZK", "ML", "web3", "backends"],
    approach: "build obsessively.",
};

export const LOG_ENTRIES = posts;

export const MARQUEE_TEXTS = ["structure", "constraint", "iteration"];

export const FOOTER_CONTENT = {
    description: "i'm active almost all the time. to be specific, on discord (mainly).",
    copyright: "© 2077 xylen",
};
