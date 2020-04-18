from django.http import JsonResponse,HttpResponse
def getResponse(status,message,data=None,previous_page=None,next_page=None,num_of_pages=None):
    response={}
    response['status']=status
    response['message']=message
    if data is not None:
        response['data']=data
    if previous_page is not None:
        response['previous_page']=previous_page
    if next_page is not None:
        response['next_page']=next_page
    if num_of_pages is not None:
        response['num_of_pages']=num_of_pages
    return JsonResponse(response)
    # return JsonResponse(response,status=status)