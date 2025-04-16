export const FREE_INITIAL_TOKEN_AMOUNT = 2;

export const POLAR_PRODUCT_IDS = {
	"3_TOKENS": {
		id: "7de2cf42-ca66-4669-b7dd-8c5ba1a50137",
		amount: 3,
	},
	"5_TOKENS": {
		id: "8e2f8241-6edd-4a4a-ae5a-ed58fd031509",
		amount: 5,
	},
	"10_TOKENS": {
		id: "ef1408e3-d305-4c99-9ab3-84d3cd777845",
		amount: 10,
	},
};

export const POLAR_TOKEN_AMOUNTS_BY_IDS = {
	[POLAR_PRODUCT_IDS["3_TOKENS"].id]: POLAR_PRODUCT_IDS["3_TOKENS"].amount,
	[POLAR_PRODUCT_IDS["5_TOKENS"].id]: POLAR_PRODUCT_IDS["5_TOKENS"].amount,
	[POLAR_PRODUCT_IDS["10_TOKENS"].id]: POLAR_PRODUCT_IDS["10_TOKENS"].amount,
};
