Payback = function() {
	this.irradiacao = 5; //kWh/m².dia
	this.irradiacaoConhecida = {
		"Dois Vizinhos":		5.13,
		"Francisco Beltrão":	5.03,
		"Guarapuava":			4.88,
		"Itapejara d'Oeste":	5.08,
		"Marmeleiro":			5.03,
		"Nova Prata":			5.14,
		"Pato Branco":			5.08,
		"Planalto":				5.09,
		"Realeza":				5.12,
		"Renascença":			5.05,
		"Salto do Lontra":		5.1,
		"Verê":					5.11
	}
	this.tarifa = 0.65; //R$/kWh
	this.reajusteTarifa = 8; //% ao ano
	this.potencia = 3; //kWp
	this.performance = 80; //%
	this.degradacao = 0.7; //% ao ano
	this.degradacaoPrimeiroAno = 2.5; //%
	this.manutencao = 0.5; //% ao ano
	this.reajusteOpex = 8; //% ao ano
	
	this.investimentoInicial = 20000; //R$
	this.jurosTMA = 8; //% ao ano
	
	this.periodoAnalise = 25 + 1; //anos
	
	this.fluxoCaixaAcumulado = [];
	
	this.energia = function() { //kWh/ano
		return this.potencia * 365 * (this.performance / 100.0) * this.irradiacao;
	}
	
	this.inicializarCampos = function() {
		document.getElementById("irradiacao").value = this.irradiacao;
		document.getElementById("tarifa").value = this.tarifa;
		document.getElementById("potencia").value = this.potencia;
		document.getElementById("investimentoInicial").value = this.investimentoInicial;
		
		this.carregarCidades();
		
	}
	
	this.carregarCidades = function() {
		var select = document.getElementById("cidade");
		
		Object.keys(this.irradiacaoConhecida).forEach(function (cidade) {
			var option = document.createElement("option");
			option.value = cidade;
			option.innerHTML = cidade;
			select.appendChild(option);
		});
		cidade = "Outra localidade";
		var option = document.createElement("option");
		option.value = cidade;
		option.innerHTML = cidade;
		select.appendChild(option);
		
		select.onclick = this.carregarIrradiacaoCidade;
	}
	
	this.carregarIrradiacaoCidade = function() {
		var select = document.getElementById("cidade");
		document.getElementById("irradiacao").value = payback.irradiacaoConhecida[select.value] || 5;
	}
	
	this.calcular = function() {
		this.irradiacao = parseFloat(document.getElementById("irradiacao").value);
		this.tarifa = parseFloat(document.getElementById("tarifa").value);
		this.potencia = parseFloat(document.getElementById("potencia").value);
		this.investimentoInicial = parseFloat(document.getElementById("investimentoInicial").value);
		this.montarTabela();
		var payback = this.calcularPayback();
		document.getElementById("payback").innerHTML = "Payback " + payback;
		var corpo = document.getElementById("tabela").style.display = "";
		var economiaMes = this.economiaMes();
		document.getElementById("economiaMes").innerHTML = "Economia primeiro mês R$ " + economiaMes.toFixed(2);
		var economiaAno = this.economiaAno();
		document.getElementById("economiaAno").innerHTML = "Economia primeiro ano R$ " + economiaAno.toFixed(2);
	}

	this.montarTabela = function() {
		var geracao = this.calcularGeracao();
		var tarifas = this.calcularTarifas();
		var reembolso = this.calcularReembolso(geracao, tarifas);
		var capex = this.listarCapex();
		var opex = this.calcularOpex();
		var fluxoCaixaAnual = this.gerarFluxoDeCaixa(reembolso, capex, opex);
		this.fluxoCaixaAcumulado = [];
		this.fluxoCaixaAcumulado = this.gerarFluxoDeCaixaAcumulado(fluxoCaixaAnual);
		var corpo = document.getElementById("corpoTabela");
		corpo.innerHTML = "";
		for (var i = 0; i < geracao.length; i++) {
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			td.innerHTML = i;
			tr.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = geracao[i].toFixed(2);
			tr.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = tarifas[i].toFixed(2);
			tr.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = reembolso[i].toFixed(2);
			tr.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = capex[i].toFixed(2);
			tr.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = opex[i].toFixed(2);
			tr.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = fluxoCaixaAnual[i].toFixed(2);
			tr.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = this.fluxoCaixaAcumulado[i].toFixed(2);
			tr.appendChild(td);
			corpo.appendChild(tr);
		}
	}
	
	this.calcularPayback = function() {
		for (var i = 0; i < this.fluxoCaixaAcumulado.length; i++) {
			if (this.fluxoCaixaAcumulado[i] > 0) {
				var meses = parseInt(-this.fluxoCaixaAcumulado[i - 1] / (this.fluxoCaixaAcumulado[i] - this.fluxoCaixaAcumulado[i - 1]) * 12 + 0.49);
				var anos = (i - 1);
				var retorno = "";
				if (anos > 0)
					retorno += anos + " ano" + (anos > 1 ? "s" : "");
				if (meses > 0)
					retorno += " " + meses + (meses > 1 ? " meses" : " mês");
				return retorno;
			}
		}
	}
	
	this.economiaMes = function() { //kWh
		return this.potencia * 30.0 * (this.performance / 100.0) * this.irradiacao * this.tarifa;
	}
	
	this.economiaAno = function() { //kWh
		return this.energia() * this.tarifa;
	}
	
	this.calcularGeracao = function() {
		var list = [];
		list.push(0);
		list.push(this.energia());
		list.push(list[1] * (1 - this.degradacaoPrimeiroAno / 100.0));
		for (var i = 3; i < this.periodoAnalise; i++) {
			list.push(list[i - 1] * (1 - this.degradacao / 100.0));
		}
		return list;
	}
	
	this.calcularTarifas = function() {
		var list = [];
		list.push(this.tarifa);
		for (var i = 1; i < this.periodoAnalise; i++) {
			list.push(list[i - 1] * (1 + this.reajusteTarifa / 100.0));
		}
		return list;
	}
	
	this.calcularReembolso = function(geracao, tarifas) {
		var list = [];
		for (var i = 0; i < this.periodoAnalise; i++) {
			list.push(geracao[i] * tarifas[i]);
		}
		return list;
	}
	
	this.listarCapex = function() {
		var list = [];
		list.push(-this.investimentoInicial);
		for (var i = 1; i < this.periodoAnalise; i++) {
			list.push(0);
		}
		return list;
	}
	
	this.calcularOpex = function() {
		var list = [];
		list.push(0);
		list.push(-this.investimentoInicial * (this.manutencao / 100.0));
		for (var i = 2; i < this.periodoAnalise; i++) {
			list.push(list[i - 1] * (1 + this.reajusteTarifa / 100.0));
		}
		return list;
	}
	
	this.gerarFluxoDeCaixa = function(reembolso, capex, opex) {
		console.log(reembolso != null, capex != null, opex != null);
		var list = [];
		for (var i = 0; i < this.periodoAnalise; i++) {
			var r = reembolso[i];
			var c = capex[i];
			var o = opex[i];
			list.push(r + c + o);
		}
		return list;
	}
	
	this.gerarFluxoDeCaixaAcumulado = function(fluxoAnual) {
		var list = [];
		list.push(fluxoAnual[0]);
		for (var i = 1; i < this.periodoAnalise; i++) {
			list.push(list[i - 1] + fluxoAnual[i]);
		}
		return list;
	}
	
}
payback = new Payback();