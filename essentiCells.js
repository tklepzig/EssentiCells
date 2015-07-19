var ec = (function ($)
{
    var module = {};
    var menuSpacing = 8;

    function centerMenu()
    {
        $(".menu:not(.left):not(.right)").each(function ()
        {
            $(this).css("left", $(window).width() / 2 - $(this).outerWidth(true) / 2);
        });
    }

    function getParentSubMenuIds(id)
    {
        var $callerButton = $("[data-sub-menu-id='" + id + "']");
        var $callerButtonSubMenu = $callerButton.closest(".sub-menu");
        var list = [];

        if ($callerButtonSubMenu.length > 0)
        {
            var callerButtonSubMenuId = $callerButtonSubMenu.attr("id");
            getParentSubMenuIds(callerButtonSubMenuId);
            list.push(callerButtonSubMenuId);
        }

        return list;
    }

    function showSubMenu(id)
    {
        var $subMenu = $("#" + id);

        if ($subMenu.hasClass("visible"))
            return;

        var parentSubMenuIds = getParentSubMenuIds(id);
        var position = $subMenu.closest(".menu").outerHeight() + menuSpacing;
        for (var i = 0; i < parentSubMenuIds.length; i++)
        {
            position += $("#" + parentSubMenuIds[i]).outerHeight() + menuSpacing;
        }

        if ($subMenu.closest(".menu").hasClass("bottom"))
            $subMenu.css("bottom", position);
        else
            $subMenu.css("top", position);


        if ($subMenu.hasClass("list"))
        {
            var $callerButton = $("[data-sub-menu-id='" + id + "']");
            var left = Math.round($callerButton.position().left + $callerButton.width() / 2 - $subMenu.width() / 2);

            if (left < -1)
                left = -1;

            $subMenu.css("left", left);
        }

        $subMenu.addClass("visible");
    }

    module.toggleSubMenu = function (id)
    {
        var $subMenu = $("#" + id);

        if ($subMenu.hasClass("visible"))
        {
            module.closeSubMenu(id);
        }
        else
        {
            module.openSubMenu(id);
        }
    };

    module.openSubMenu = function (id)
    {
        var $subMenu = $("#" + id);

        if ($subMenu.length === 0)
            return;

        var parentSubMenuIds = getParentSubMenuIds(id);

        //close all sub-menus but this one and its parents
        $subMenu.closest(".menu").find(".sub-menu").filter(function ()
        {
            return $(this).attr("id") !== id && $.inArray($(this).attr("id"), parentSubMenuIds);

        }).removeClass("visible");

        //open parent menus
        for (var i = 0; i < parentSubMenuIds.length; i++)
        {
            showSubMenu(parentSubMenuIds[i]);
        }

        //open this one
        showSubMenu(id);
    };

    module.closeSubMenu = function (id, includeParents)
    {
        includeParents = (typeof includeParents === "undefined") ? false : true;

        var $subMenu = $("#" + id);

        if (!$subMenu.hasClass("visible"))
            return;

        //close all child sub-menus
        $subMenu.children("[data-sub-menu-id]").each(function ()
        {
            module.closeSubMenu($(this).data("sub-menu-id"));
        });

        $subMenu.removeClass("visible");

        if (includeParents)
        {
            var parents = getParentSubMenuIds(id);
            for (var i = 0; i < parents.length; i++)
            {
                var $parentMenu = $("#" + parents[i]);
                $parentMenu.removeClass("visible");
            }
        }
    };


    $(function ()
    {
        centerMenu();
        $(".menu").addClass("visible");

        $(window).resize(centerMenu);

        // TODO: call centerMenu also on DOM changes --> MutationObserver

        //sub-menu handling
        $(".menu").on("click", "[data-sub-menu-id]", function ()
        {
            module.toggleSubMenu($(this).data("sub-menu-id"));
        });

        $(".menu").on("click", ".sub-menu button:not([data-sub-menu-id]), .sub-menu.list li:not([data-sub-menu-id])", function ()
        {
            //simply close all sub-menus of current menu

            //if (!$(".menu").hasClass("pinned"))
            $(this).closest(".menu").find(".sub-menu").removeClass("visible");
        });
    });

    return module;

})(jQuery);
