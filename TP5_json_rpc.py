from werkzeug.wrappers import Request, Response
from werkzeug.serving import run_simple
from jsonrpc import JSONRPCResponseManager, dispatcher

def arrosage(etat):
    isArrose = "on" if etat == "arrose" else "off"
    print(etat)
    return isArrose

@Request.application
def application(request):
    # Dispatcher is dictionary {<method_name>: callable}
    dispatcher["arrosage"] = arrosage

    response = JSONRPCResponseManager.handle(
        request.data, dispatcher)
    return Response(response.json, mimetype='application/json')

def connexionServerJsonRpc():
    run_simple("localhost", 8000, application)

connexionServerJsonRpc()