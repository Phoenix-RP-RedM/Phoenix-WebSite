-- #############################################################################
-- #                                                                           #
-- #             __________._                         .__                      #
-- #            \______   \  |__   ____   ____   ____ |__|__  ___              #
-- #             |     ___/  |  \ /  _ \_/ __ \ /    \|  \  \/  /              #
-- #             |    |   |   Y  (  <_> )  ___/|   |  \  |>    <               #
-- #             |____|   |___|  /\____/ \___  >___|  /__/__/\_ \              #
-- #                           \/            \/     \/         \/              #
-- #                                                                           #
-- #############################################################################

PhoenixSettings = {}
PhoenixSync = nil
LABELS = {}
translatedLabels = {}

AddEventHandler("PhoenixSync>Modules>[SHORT_MODULE_NAME_HERE]", function(coffee)
  PhoenixSettings = coffee.settings
  PhoenixSync = coffee.sync

  if IsDuplicityVersion() then
    -- start server side threads
  else
    -- start client side threads
    translatedLabels = LABELS[coffee.language.code]
  end
end)