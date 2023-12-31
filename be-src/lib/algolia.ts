import "dotenv/config";
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
    process.env.ALGOLIA_APPLICATION_ID,
    process.env.ALGOLIA_API_KEY);//admin API key
const index = client.initIndex('pets');

export { index };
