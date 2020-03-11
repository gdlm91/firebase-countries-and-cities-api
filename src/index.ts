import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

import csc, { ICountry, ICity } from 'country-state-city';

type CountriesOrCities = ICountry[] | ICity[];

type CountryOrCity = ICountry | ICity;

function sortByName(countriesOrCities: CountriesOrCities): CountriesOrCities {
    return countriesOrCities.sort((a: CountryOrCity, b: CountryOrCity) => {
        const lowerA = a.name.toLowerCase();
        const lowerB = b.name.toLowerCase();

        if (lowerA < lowerB) {
            return -1;
        } else if (lowerA > lowerB) {
            return 1;
        }

        return 0;
    });
}

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

app.get('/countries', (req, res) => res.send(sortByName(csc.getAllCountries())));

app.get('/countries/:code/cities', (req, res) => {
    const { code } = req.params as { code: ICountry['sortname'] };
    const country = csc.getCountryByCode(code);

    if (!country) {
        res.status(404).send(`Country with code ${code} not found`);
        return;
    }

    const states = csc.getStatesOfCountry(country.id);
    const cities = states
        .map(_state => csc.getCitiesOfState(_state.id))
        .reduce((acc, cities) => {
            return [...acc, ...cities];
        }, []);

    res.send(sortByName(cities));
});

export const api = functions.https.onRequest(app);
