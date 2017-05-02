$(document).ready(function() 
{
    //alert("favorites.js");
    //look in local storage
    //get all the market ids start with mid#####
    var allKeys;

    //first check if they have re-ordered them
    if(window.localStorage.getItem("midOrder") !== null)
    {
        allKeys = window.localStorage.getItem("midOrder");
        allKeys = JSON.parse(allKeys);
        console.log(allKeys); 
    }
    else
    {
        allKeys = Object.keys(localStorage);
        console.log(allKeys);
    }
    allKeys.forEach(function(element, index, array){
   
        if(element.indexOf('mid') !== -1)
        {
            //alert(element);
            //add the market to the accordian div
            var newJson = window.localStorage.getItem(element);
            newJson = JSON.parse(newJson);
            var newDiv = '<div class="group" id=' + element + '>';
            newDiv += '<h3 mid='+ element +'>' + newJson.name + '</h3>';
            newDiv += '<div><p>' + newJson.address + '</p>';
            newDiv += '<p>' + newJson.products + '</p>';
            newDiv += '<p>' + newJson.schedule + '</p>';
            newDiv += '<p><a href=' + newJson.googleLink + ' target=_page>Map It!</a></p>';
             newDiv += '<button class="padd" id=' + element.substring(3) + 'Market>Remove Market</button></p>';
            newDiv += '<p><button id=' + element.substring(3) + '>Add Vendor</button>';
            newDiv += '<div id=' + element.substring(3) + 'Vendors></div>';
            newDiv += '</div></div>';
            $('#accordion').append(newDiv);

            console.log(newJson.vendors.length);
            var allVendors = newJson.vendors;
            if(allVendors.length > 0)
            {
                allVendors.forEach(function(vElement, vIndex, vArray){
                    newDiv = '<div id=' + vIndex + vElement.name + '>';
                    newDiv += '<h4>Name: ' + vElement.name + '</h4>';
                    newDiv += '<div><p>Location: ' + vElement.location + '</p>';
                    newDiv += '<p>Notes: ' + vElement.notes + '</p>';
                    newDiv += '<button id="remove' + vIndex + '">Remove Vendor</button>';
                    newDiv += '</div></div>';
                    $('#' + element.substring(3) + "Vendors").append(newDiv);

                    $('#remove' + vIndex).button().click(function(){
                        //remove the 
                        console.log(vIndex);
                        console.log(element);
                        var removeJson = window.localStorage.getItem(element);
                        removeJson = JSON.parse(removeJson);
                        var delIndex = removeJson.vendors.map(function(e){return e.name;}).indexOf(vElement.name);
                        //alert(delIndex);
                        removeJson.vendors.splice(delIndex, 1);
                        removeJson = JSON.stringify(removeJson);
                        window.localStorage.setItem(element, removeJson);
                        $('#' + vIndex + vElement.name).remove();
                        $('#' + element.substring(3) + "Vendors").accordion("refresh");
                        //alert("Made it");
                    });


                    $( "#" + element.substring(3) + "Vendors").accordion({
                        header: "> div > h4",
                        collapsible: true
                    });

                    $('#' + element.substring(3) + "Vendors").accordion("refresh");
                });//end vendors
            }
            
            var $btnId = $('#' + element.substring(3));
            
            $('#' + element.substring(3) + "Market").button().click(function(){
                //remove the market
                if(window.localStorage.getItem('midOrder') !== null)
                {
                    var removeMarketJson = window.localStorage.getItem('midOrder');
                    removeMarketJson = JSON.parse(removeMarketJson);
                    console.log(removeMarketJson);
                    //alert(element);
                    //alert(removeMarketJson.indexOf(element));
                    removeMarketJson.splice(removeMarketJson.indexOf(element), 1);
                    console.log(removeMarketJson);

                    removeMarketJson = JSON.stringify(removeMarketJson);
                    window.localStorage.setItem('midOrder', removeMarketJson);
                }
                window.localStorage.removeItem(element);
                $('#' + element).remove();
                 $('#accordion').accordion( "refresh" );

            });//end remove button

            $($btnId).button();

            $($btnId).click( function() {
                //alert($(this).attr('id'));
                var $thisId = $(this).attr('id');
                var newHtml = '<div>';
                newHtml += '<p><label class="pad" for=' + $thisId + 'Name>Name</label><br>';
                newHtml += '<input id=' + $thisId + 'Name></input></p>';
                newHtml += '<p><label class="pad" for=' + $thisId + 'Location>Location</label><br>';
                newHtml += '<input id=' + $thisId + 'Location></input></p>';
                newHtml += '<p><label class="pad" for=' + $thisId + 'Notes>Notes</label><br>';
                newHtml += '<textarea id=' + $thisId + 'Notes></textarea></p>';
                newHtml += '</div>';
                $(newHtml).dialog({
                    width: 'auto',
                    maxWidth: 600,
                    height: 'auto',
                    title: 'Add Vendor',
                    close: function(event, ui) {
                        $(this).dialog('destroy').remove();
                        window.scrollTo(0, 0);
                    },
                    modal: true,
                    fluid: true,
                    buttons: {
                        "Cancel" : function() {
                            $(this).dialog("destroy").remove();
                            window.scrollTo(0, 0);
                        },
                        "Add" : function() {
                            //add vendor to this market
                            var newName = $('#' + $thisId + 'Name').val();
                            var newLocation = $('#' + $thisId + 'Location').val();
                            var newNotes = $('#' + $thisId + 'Notes').val();
                            addVendor(newName, newLocation, newNotes, $thisId + "Vendors", "mid" + $thisId);
                            $(this).dialog("destroy").remove();
                            window.scrollTo(0, 0);
                        }
                    }
                });//end add vendor dialog
            });//end .click
        }//end if mid
    });//end all keys

    $( "#accordion" )
        .accordion({
            header: "> div > h3",
            collapsible: true
        })
        .sortable({
            axis: "y",
            handle: "h3",
            stop: function( event, ui ) {
                // IE doesn't register the blur when sorting
                // so trigger focusout handlers to remove .ui-state-focus
                ui.item.children( "h3" ).triggerHandler( "focusout" );
 
                var divs = $('.group h3');
                var midOrder = [];
                console.log(divs);
                divs.each(function(index){
                    //alert($(this).attr("mid"));
                    midOrder.push($(this).attr("mid"));
                });
                midOrder = JSON.stringify(midOrder);
                window.localStorage.setItem('midOrder', midOrder);
                // Refresh accordion to handle new order
                $( this ).accordion( "refresh" );
            }//end stop
        });//end sortable
});
/* *****************************************************************
Add new vendor to a specific location 
**************************************************************** */
function addVendor(name, location, notes, vendorId, marketId)
{
    //alert(name + ' ' + location + ' ' + notes + ' ' + vendorId + ' ' + marketId);
    //get the market and save the vendor
    var myMarket = parent.window.localStorage.getItem(marketId);
    console.log(myMarket);
    myMarket = JSON.parse(myMarket);
    var myVendor = {
        name: name,
        location: location,
        notes: notes
    };

    myMarket.vendors.push(myVendor);
    //get index make button exactly the same
    var insertIndex = myMarket.vendors.map(function(e){return e.name;}).indexOf(name);
    myMarket = JSON.stringify(myMarket);
    window.localStorage.setItem(marketId, myMarket);

    var newDiv = '<div id=' + insertIndex + name + '>';
    newDiv += '<h4>Name: ' + name + '</h4>';
    newDiv += '<div><p>Location: ' + location + '</p>';
    newDiv += '<p>Notes: ' + notes + '</p>';
    newDiv += '<button id="remove' + insertIndex + '">Remove Vendor</button>';
    newDiv += '</div></div>';
    $('#' + vendorId).append(newDiv);
    
    $('#remove' + insertIndex).button().click(function(){
        //remove the 
        var removeJson = window.localStorage.getItem(marketId);
        removeJson = JSON.parse(removeJson);
        var delIndex = removeJson.vendors.map(function(e){return e.name;}).indexOf(name);
        //alert(delIndex);
        removeJson.vendors.splice(delIndex, 1);
        removeJson = JSON.stringify(removeJson);
        window.localStorage.setItem(marketId, removeJson);
        $('#' + insertIndex + name).remove();
        $('#' + vendorId).accordion("refresh");
        //alert("Made it");
     });

    $( "#" + vendorId ).accordion({
            header: "> div > h4"
    });
    $('#' + vendorId).accordion("refresh");
}