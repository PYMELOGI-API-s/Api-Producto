
const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, startServer } = require('../server'); // Importar app y startServer
const expect = chai.expect;

chai.use(chaiHttp);

describe('Products API', () => {
    let server;
    let createdProduct;

    // Iniciar el servidor antes de todas las pruebas
    before(async () => {
        server = await startServer();
    });

    // Cerrar el servidor después de todas las pruebas
    after((done) => {
        server.close(done);
    });

    it('should GET all products', (done) => {
        chai.request(app)
            .get('/api/productos')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.data).to.be.an('array');
                done();
            });
    });

    it('should POST a new product', (done) => {
        const newProduct = {
            nombre: 'Test Product',
            descripcion: 'This is a test product',
            codigoBarras: Math.floor(100000000000 + Math.random() * 900000000000).toString(), // Generar un código de barras de 12 dígitos
            precio: 10.99,
            stock: 100,
            categoria: 'Test',
            imagen: 'http://example.com/test.jpg' // Usar una URL válida
        };
        chai.request(app)
            .post('/api/productos')
            .send(newProduct)
            .end((err, res) => {
                if (res.status !== 201) {
                    console.log(res.body);
                }
                expect(res).to.have.status(201);
                expect(res.body.success).to.be.true;
                expect(res.body.data).to.have.property('id');
                createdProduct = res.body.data;
                done();
            });
    });

    it('should GET a single product by id', (done) => {
        chai.request(app)
            .get(`/api/productos/${createdProduct.id}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.data).to.have.property('id').eql(createdProduct.id);
                done();
            });
    });

    it('should PUT (update) a product', (done) => {
        const updatedProduct = {
            nombre: 'Updated Test Product',
            precio: 12.99
        };
        chai.request(app)
            .put(`/api/productos/${createdProduct.id}`)
            .send(updatedProduct)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.data.nombre).to.equal(updatedProduct.nombre);
                expect(res.body.data.precio).to.equal(updatedProduct.precio);
                done();
            });
    });

    it('should DELETE a product', (done) => {
        chai.request(app)
            .delete(`/api/productos/${createdProduct.id}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            });
    });
});
