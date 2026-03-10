import '/flutter_flow/flutter_flow_util.dart';
import 'api_manager.dart';

export 'api_manager.dart' show ApiCallResponse;

class VotdSearchCall {
  static Future<ApiCallResponse> call({
    String? verseId = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'votdSearch',
      apiUrl:
          'https://api.scripture.api.bible/v1/bibles/48acedcf8595c754-01/search',
      callType: ApiCallType.GET,
      headers: {
        'accept': 'application/json',
        'api-key': 'fd216dcff27b09c1ceb905435ec77d8f',
      },
      params: {
        'query': verseId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static String? referencia(dynamic response) =>
      castToType<String>(getJsonField(
        response,
        r'''$.data.passages[:].reference''',
      ));
  static String? contentHtml(dynamic response) =>
      castToType<String>(getJsonField(
        response,
        r'''$.data.passages[:].content''',
      ));
}

class ApiPagingParams {
  int nextPageNumber = 0;
  int numItems = 0;
  dynamic lastResponse;

  ApiPagingParams({
    required this.nextPageNumber,
    required this.numItems,
    required this.lastResponse,
  });

  @override
  String toString() =>
      'PagingParams(nextPageNumber: $nextPageNumber, numItems: $numItems, lastResponse: $lastResponse,)';
}


