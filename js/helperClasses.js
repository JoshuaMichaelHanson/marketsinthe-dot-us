/* *****************************************************
Generic map object to hold stuff
****************************************************************** */
function JoshMap (usedBy) {
	this.usedby = usedBy;
	this.jMap = Object.create(null);
}
JoshMap.prototype.put = function(jmName, jmValue) {
	this.jMap[jmName] = jmValue;
};
JoshMap.prototype.get = function(jmName) {

	if(jmName in this.jMap)
	{
		return this.jMap[jmName];
	}
	else
	{
		return "Does not exist";
	}
};
/* *******************************************************************
Make jQuery UI Dialog more responsive
************************************************************** */
$(window).resize(function () {
    fluidDialog();
});

$(document).on("dialogopen", ".ui-dialog", function (event, ui) {
    fluidDialog();
});

function fluidDialog() {
    var $visible = $(".ui-dialog:visible");
    // each open dialog
    $visible.each(function () {
        var $this = $(this);
        var dialog = $this.find(".ui-dialog-content").data("ui-dialog");
        // if fluid option == true
        if (dialog.options.fluid) {
            var wWidth = $(window).width();
            // check window width against dialog width
            if (wWidth < (parseInt(dialog.options.maxWidth) + 50))  {
                // keep dialog from filling entire screen
                $this.css("max-width", "90%");
            } else {
                // fix maxWidth bug
                $this.css("max-width", dialog.options.maxWidth + "px");
            }
            //reposition dialog
            dialog.option("position", dialog.options.position);
        }
    });

}
