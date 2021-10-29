const express = require('express');
const keys = require('./settings/key');
const app = express();
const jwt = require('jsonwebtoken');

app.set('key', keys.pass);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hola Mundo');
});

app.listen(3000, () => {
	console.log('Servidor UP en http://localhost:3000');
});

app.post('/login', (req, res) => {
	let obj = { mensaje: 'Error de autenticacion.' };
	if (req.body.usuario == 'admin' && req.body.pass == '12345') {
		const payload = {
			check: true,
		};
		const token = jwt.sign(payload, app.get('key'), {
			expiresIn: '7d',
		});
		obj = { mensaje: 'Autenticacion exitosa', token };
	}
	res.json(obj);
});

const verificacion = express.Router();

verificacion.use((req, res, next) => {
	let token = req.headers['x-access-token'] || req.headers['authorization'];
	if (!token) {
		res.status(401).send({
			error: 'Es necesario un token de autentificacion',
		});
		return;
	}
	if (token.startsWith('Bearer ')) {
		token = token.slice(7, token.length);
		console.log(token);
	}
	if (token) {
		jwt.verify(token, app.get('key'), (error, decoded) => {
			if (error) {
				return res.json({
					mensaje: 'Token no es valido.',
				});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	}
});

app.get('/info', verificacion, (req, res) => {
	res.json('Informacion importante y delicada entregada');
});
