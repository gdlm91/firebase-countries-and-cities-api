import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

import csc from 'country-state-city';
import { ICountry } from 'country-state-city';

const app = express();

app.use(cors({ origin: true }));

app.get('/', (req, res) =>
    res.send(`
    <h1>Available API</h1>
    <ul>
        <li><a href="api/countries">api/countries</a>: get a list of all available countries</li>
        <li><a href="api/countries/{country-shortname}/cities">api/countries/{country-shortname}/cities</a>: get a list of all cities for a country</li>
    </ul>
`),
);

app.get('/countries', (req, res) => res.send(csc.getAllCountries()));

app.get('/countries/:code/cities', (req, res) => {
    const { code } = req.params as { code: ICountry['sortname'] };
    const country = csc.getCountryByCode(code);

    if (!country) {
        res.status(404).send(`Country with code ${code} not found`);
        return;
    }

    const states = csc.getStatesOfCountry(country.id);
    const cities = states.map(_state => csc.getCitiesOfState(_state.id)).flat(1);

    res.send(cities);
});

export const api = functions.https.onRequest(app);
