var moneyVar = 0.00;
var sound = true;
var changeReturn = false;
var itemSelected = null;

$(document).ready(function() {
    clearFields();
    loadContent();
    moneyButtons();
    purchaseButton();
    changeButton();
    audioToggle();
});

function loadContent() {
    clearFields();
    $("#itemsDiv").empty();
    var rows = $("#itemsDiv");

    $.ajax({
        type: "GET",
        url: "http://tsg-vending.herokuapp.com/items",
        success: function(itemArray) {
            $.each(itemArray, function(index, item) {
                var itemId = item.id;

                var row = '<div class="col-md-4 items>';
                row += '<a href="javascript:void(0);">';
                row += '<div class="card m-2" style="height: 16rem;" id="item'+index+'">';
                row += '<div class="card-body mb-3">';
                row += '<h5 class="card-title">'+itemId+'</h5>';
                row += '<h5 class="card-text text-center"><a href="javscript:void(0);" onclick="selectItem('+itemId+')">'+item.name+'</a></h5>';
                row += '<h5 class="card-text text-center">$'+item.price+'</h5>';
                row += '<br>';
                row += '<h5 class="card-text text-center">Quantity Left: '+item.quantity+'</h5>';
                row += '</div>';
                row += '</div>';
                row += '</a>';
                row += '</div>';

                rows.append(row);
            });
        },
        error: function(xhr) {
            xhrError(xhr);
            playSound('error');
        }
    });
}

function selectItem(itemId) {
    $("#itemNumber").val(itemId);
    itemSelected = itemId;
}

function moneyButtons() {
    $("#addDollar").click(function() {
        addMoney(1);
        playSound('money');
        $("#money").val(moneyVar);
    });

    $("#addQuarter").click(function() {
        addMoney(.25);
        playSound('money');
        $("#money").val(moneyVar);
    });

    $("#addDime").click(function() {
        addMoney(.1);
        playSound('money');
        $("#money").val(moneyVar);
    });

    $("#addNickel").click(function() {
        addMoney(.05);
        playSound('money');
        $("#money").val(moneyVar);
    });


}

function changeButton() {
    $("#changeReturn").click(function (){
        if(changeReturn) {
            changeReturn = false;
            playSound('change');
            clearFields();
            loadContent();
        }
    });
}

function purchaseButton() {
    $("#purchase").click(function() {
        if(itemSelected == null) {
            $("#messages").val("Please Select an Item");
            playSound('error');
        } else {
            $.ajax({
                type: "POST",
                url: "http://tsg-vending.herokuapp.com/money/" + moneyVar + "/item/" + itemSelected,
                dataType: "json",
                statusCode: {
                    422: function (xhr, status, err) {
                        var jsonResponse = JSON.parse(xhr.responseText);
                        $("#messages").val(jsonResponse.message);
                        playSound('error');
                    }
                },
                success: function(data) {
                    changeReturn = true;
                    moneyVar = 0;
                    $("#money").val("0.00");
                    $("#messages").val("Thank You!");
                    $("#change").val("Q: "+data.quarters+" D: "+data.dimes+" N: "+data.nickels+" P: "+data.pennies);
                    playSound('vend');
                }
            });
        }
    });
}

function addMoney(amount) {
    moneyVar += amount;
    moneyVar = Math.round(moneyVar * 100) / 100;
}

function playSound(soundId) {
    if(sound) {
        switch(soundId) {
            case 'error':
                new Audio('res/snd_error.wav').play();
                break;
            case 'vend':
                new Audio('res/snd_vend.wav').play();
                break;
            case 'change':
                new Audio('res/snd_change.wav').play();
                break;
            case 'money':
                new Audio('res/snd_money.wav').play();
                break;
            default:
                break;
        }
    }
}

function audioToggle() {
    if($("#audioToggle").change(function() {
        sound = $("#audioToggle").is(":checked");
    }));
}

function clearFields() {
    moneyVar = 0;
    itemSelected = null;
    $("#messages").val('Welcome!');
    $("#itemNumber").val('');
    $("#change").val('');
    $("#money").val('0.00');
}

function xhrError(xhr) {
    $("#errorMessages")
        .append($('<li>')
            .attr({class: 'list-group-item list-group-item-danger'})
            .text("Error contacting web service: "+xhr.status+" - "+xhr.statusText+ " - Please try again later."));
}
