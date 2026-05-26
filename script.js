let produtos = [
    {
        id: 1,
        nome: "Camisa Brasil 2026",
        descricao: "Camisa amarela da seleção brasileira",
        preco: 199.99,
        tamanho: "P, M, G, GG",
        cor: "Amarela",
        categoria: "Camisas",
        imagem: "assets/img/brasil2026.jpg",
        quantidade: 10
    },
    {
        id: 2,
        nome: "Boné Copa 2026",
        descricao: "Boné estilizado para torcedores.",
        preco: 69.99,
        tamanho: "Único",
        cor: "Azul",
        categoria: "Bonés",
        imagem: "assets/img/bone.jpg",
        quantidade: 15
    },
    {
        id: 3,
        nome: "Chuteira Profissional",
        descricao: "Chuteira para jogar futebol",
        preco: 299.99,
        tamanho: "38 ao 43",
        cor: "Preta",
        categoria: "Chuteiras",
        imagem: "assets/img/chuteira.jpg",
        quantidade: 10
    },
    {
        id: 4,
        nome: "Bola Copa 2026",
        descricao: "Bola oficial da Copa do Mundo 2026",
        preco: 119.99,
        tamanho: "Oficial",
        cor: "Branca",
        categoria: "Acessórios",
        imagem: "assets/img/bola.jpeg",
        quantidade: 20
    }
];

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function mostrarProdutos(lista) {
    let area = document.getElementById("listaProdutos");

    area.innerHTML = "";

    lista.forEach(function(produto) {
        area.innerHTML += `
            <div class="col-md-4">
                <div class="card card-produto shadow-sm h-100">
                    <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">

                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>

                        <p class="card-text">${produto.descricao}</p>

                        <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2).replace(".", ",")}</p>
                        <p><strong>Tamanho:</strong> ${produto.tamanho}</p>
                        <p><strong>Cor:</strong> ${produto.cor}</p>
                        <p><strong>Categoria:</strong> ${produto.categoria}</p>
                        <p><strong>Disponível:</strong> ${produto.quantidade}</p>

                        <button class="btn btn-success w-100" onclick="adicionarCarrinho(${produto.id})">
                            Adicionar ao carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function adicionarCarrinho(id) {
    let produto = produtos.find(function(item) {
        return item.id === id;
    });

    let itemCarrinho = carrinho.find(function(item) {
        return item.id === id;
    });

    if (itemCarrinho) {
        itemCarrinho.quantidadeCarrinho++;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidadeCarrinho: 1
        });
    }

    salvarCarrinho();
    mostrarCarrinho();
}

function mostrarCarrinho() {
    let area = document.getElementById("listaCarrinho");
    let total = 0;

    area.innerHTML = "";

    if (carrinho.length === 0) {
        area.innerHTML = "<p>Seu carrinho está vazio.</p>";
    }

    carrinho.forEach(function(item) {
        total += item.preco * item.quantidadeCarrinho;

        area.innerHTML += `
            <div class="item-carrinho d-flex justify-content-between align-items-center flex-wrap">
                <div>
                    <strong>${item.nome}</strong>
                    <p class="mb-0">Preço: R$ ${item.preco.toFixed(2).replace(".", ",")}</p>
                    <p class="mb-0">Quantidade: ${item.quantidadeCarrinho}</p>
                </div>

                <div class="mt-2">
                    <button class="btn btn-sm btn-secondary" onclick="diminuirQuantidade(${item.id})">-</button>
                    <button class="btn btn-sm btn-secondary" onclick="aumentarQuantidade(${item.id})">+</button>
                    <button class="btn btn-sm btn-danger" onclick="removerCarrinho(${item.id})">Remover</button>
                </div>
            </div>
        `;
    });

    document.getElementById("totalCarrinho").innerText = total.toFixed(2).replace(".", ",");
}

function aumentarQuantidade(id) {
    let item = carrinho.find(function(produto) {
        return produto.id === id;
    });

    item.quantidadeCarrinho++;

    salvarCarrinho();
    mostrarCarrinho();
}

function diminuirQuantidade(id) {
    let item = carrinho.find(function(produto) {
        return produto.id === id;
    });

    if (item.quantidadeCarrinho > 1) {
        item.quantidadeCarrinho--;
    }

    salvarCarrinho();
    mostrarCarrinho();
}

function removerCarrinho(id) {
    carrinho = carrinho.filter(function(item) {
        return item.id !== id;
    });

    salvarCarrinho();
    mostrarCarrinho();
}

function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function filtrarProdutos() {
    let texto = document.getElementById("pesquisa").value.toLowerCase();
    let categoria = document.getElementById("filtroCategoria").value;

    let produtosFiltrados = produtos.filter(function(produto) {
        let nomeCombina = produto.nome.toLowerCase().includes(texto);
        let categoriaCombina = categoria === "todos" || produto.categoria === categoria;

        return nomeCombina && categoriaCombina;
    });

    mostrarProdutos(produtosFiltrados);
}

document.getElementById("pesquisa").addEventListener("input", filtrarProdutos);
document.getElementById("filtroCategoria").addEventListener("change", filtrarProdutos);


mostrarProdutos(produtos);
mostrarCarrinho();

if (typeof paypal !== "undefined") {
    paypal.Buttons({
        createOrder: function(data, actions) {
            let total = carrinho.reduce(function(soma, item) {
                return soma + item.preco * item.quantidadeCarrinho;
            }, 0);

            if (total === 0) {
                alert("Adicione algum produto ao carrinho antes de finalizar.");
                return;
            }

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2)
                    }
                }]
            });
        },

        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert("Compra finalizada com sucesso!");

                carrinho = [];
                salvarCarrinho();
                mostrarCarrinho();
            });
        }
    }).render("#paypal-button-container");
}