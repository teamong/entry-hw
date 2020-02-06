const _ = require('lodash');
const BaseModule = require('./baseModule');


/***************************************************************************************
 *  기본 클래스
 ***************************************************************************************/

class byrobot_dronefighter_base extends BaseModule
{
    /*
        클래스 내부에서 사용될 필드들을 이곳에서 선언합니다.
    */
    constructor()
    {
        super();


        this.serialport = null;
        this.isConnect = false;


        /***************************************************************************************
         *  드론, 조종기에 전달하는 명령
         ***************************************************************************************/

        /*
            대상 장치로부터 수신 받는 데이터는 모두 _updated 변수를 최상단에 붙임.
            업데이트 된 경우 _updated를 1로 만들고 entry로 전송이 끝나면 다시 0으로 변경
        */
        
        // Entry -> Device
        this.DataType =
        {
            // 전송 버퍼
            BUFFER_CLEAR                : 'buffer_clear',
        
            // 전송 대상
            TARGET                      : 'target',
        
            // Light Mode
            LIGHT_MODE_MODE             : 'light_mode_mode',
            LIGHT_MODE_INTERVAL         : 'light_mode_interval',
        
            // Light Event
            LIGHT_EVENT_EVENT           : 'light_event_event',
            LIGHT_EVENT_INTERVAL        : 'light_event_interval',
            LIGHT_EVENT_REPEAT          : 'light_event_repeat',
        
            // Light Manaul
            LIGHT_MANUAL_FLAGS          : 'light_manual_flags',
            LIGHT_MANUAL_BRIGHTNESS     : 'light_manual_brightness',
        
            // Buzzer
            BUZZER_MODE                 : 'buzzer_mode',
            BUZZER_VALUE                : 'buzzer_value',
            BUZZER_TIME                 : 'buzzer_time',
        
            // Vibrator
            VIBRATOR_MODE               : 'vibrator_mode',
            VIBRATOR_ON                 : 'vibrator_on',
            VIBRATOR_OFF                : 'vibrator_off',
            VIBRATOR_TOTAL              : 'vibrator_total',
        
            // Control - Double
            CONTROL_WHEEL               : 'control_wheel',
            CONTROL_ACCEL               : 'control_accel',
            
            // Control - Quad
            CONTROL_ROLL                : 'control_roll',
            CONTROL_PITCH               : 'control_pitch',
            CONTROL_YAW                 : 'control_yaw',
            CONTROL_THROTTLE            : 'control_throttle',
        
            // Command
            COMMAND_COMMAND             : 'command_command',
            COMMAND_OPTIOIN             : 'command_option',
        
            // Motor
            MOTORSINGLE_TARGET          : 'motorsingle_target',
            MOTORSINGLE_DIRECTION       : 'motorsingle_direction',
            MOTORSINGLE_VALUE           : 'motorsingle_value',
        
            // IrMessage
            IRMESSAGE_DATA              : 'irmessage_data',
        
            // UserInterface
            USERINTERFACE_COMMAND       : 'userinterface_command',
            USERINTERFACE_FUNCTION      : 'userinterface_function',
        };

        this.crc16table =
        [
            0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
            0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
            0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
            0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
            0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
            0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
            0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
            0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
            0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
            0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
            0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
            0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
            0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
            0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
            0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
            0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
            0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
            0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
            0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
            0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
            0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
            0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
            0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
            0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
            0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
            0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
            0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
            0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
            0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
            0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
            0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
            0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
        ];
    

        // -- JSON Objects ----------------------------------------------------------------
        // Device -> Entry 

        // Ack
        this.ack =
        {
            _updated            : 1,
            ack_systemTime      : 0,    // u32
            ack_dataType        : 0,    // u8
            ack_crc16           : 0,    // u16
        };
    

        // Joystick
        this.joystick = 
        {
            _updated                    : 1,
            joystick_left_x             : 0,    // s8
            joystick_left_y             : 0,    // s8
            joystick_left_direction     : 0,    // u8
            joystick_left_event         : 0,    // u8
            joystick_left_command       : 0,    // u8
            joystick_right_x            : 0,    // s8
            joystick_right_y            : 0,    // s8
            joystick_right_direction    : 0,    // u8
            joystick_right_event        : 0,    // u8
            joystick_right_command      : 0,    // u8
        };
    

        // Button
        this.button = 
        {
            _updated        : 1,
            button_button   : 0,    // u16
            button_event    : 0,    // u8
        };
    

        // State
        this.state = 
        {
            _updated                : 1,
            state_modeVehicle       : 0,    // u8
            state_modeSystem        : 0,    // u8
            state_modeFlight        : 0,    // u8
            state_modeDrive         : 0,    // u8
            state_sensorOrientation : 0,    // u8
            state_coordinate        : 0,    // u8
            state_battery           : 0,    // u8
        };


        // Attitude
        this.attitude =
        {
            _updated                : 1,
            attitude_roll           : 0,
            attitude_pitch          : 0,
            attitude_yaw            : 0,
        };
    

        // IR Message
        this.irmeessage = 
        {
            _updated                : 1,
            irmessage_irdata        : 0,
        };


        // -- Control -----------------------------------------------------------------
        this.controlWheel           = 0;        // 
        this.controlAccel           = 0;        // 
        this.controlRoll            = 0;        // 
        this.controlPitch           = 0;        // 
        this.controlYaw             = 0;        // 
        this.controlThrottle        = 0;        // 


        // -- Hardware ----------------------------------------------------------------
        this.bufferReceive          = [];       // 데이터 수신 버퍼
        this.bufferTransfer         = [];       // 데이터 송신 버퍼

        this.dataType               = 0;        // 수신 받은 데이터의 타입
        this.dataLength             = 0;        // 수신 받은 데이터의 길이
        this.from                   = 0;        // 송신 장치 타입
        this.to                     = 0;        // 수신 장치 타입
        this.indexSession           = 0;        // 수신 받는 데이터의 세션
        this.indexReceiver          = 0;        // 수신 받는 데이터의 세션 내 위치
        this.dataBlock              = [];       // 수신 받은 데이터 블럭
        this.crc16Calculated        = 0;        // CRC16 계산 된 결과
        this.crc16Received          = 0;        // CRC16 수신 받은 블럭
        this.crc16Transfered        = 0;        // 전송한 데이터의 crc16
        
        this.maxTransferRepeat      = 3;        // 최대 반복 전송 횟수
        this.countTransferRepeat    = 0;        // 반복 전송 횟수
        this.dataTypeLastTransfered = 0;        // 마지막으로 전송한 데이터의 타입

        this.timeReceive            = 0;        // 데이터를 전송 받은 시각
        this.timeTransfer           = 0;        // 예약 데이터를 전송한 시각
        this.timeTransferNext       = 0;        // 전송 가능한 다음 시간
        this.timeTransferInterval   = 40;       // 최소 전송 시간 간격

        this.countReqeustDevice     = 0;        // 장치에 데이터를 요청한 횟수 카운트

        this.targetDevice           = 0;            // 연결 대상 장치 DeviceType
        this.targetDeviceID         = undefined;    // 연결 대상 장치의 ID
        this.targetModeVehicle      = 0;            // 연결 대상 장치의 Vehicle 모드
    }

    /*
        초기설정

        최초에 커넥션이 이루어진 후의 초기 설정.
        handler 는 워크스페이스와 통신하 데이터를 json 화 하는 오브젝트입니다. (datahandler/json 참고)
        config 은 module.json 오브젝트입니다.
    */
    init(handler, config)
    {
        super.init(handler, config);
        //this.resetData();
    }


    /*
        초기 송신데이터(필수)

        연결 후 초기에 송신할 데이터가 필요한 경우 사용합니다.
        requestInitialData 를 사용한 경우 checkInitialData 가 필수입니다.
        이 두 함수가 정의되어있어야 로직이 동작합니다. 필요없으면 작성하지 않아도 됩니다.
    */
    requestInitialData(serialport)
    {
        if (!this.serialport)
        {
            this.isConnect = true;
            this.serialport = serialport;
        }

        return this.ping(this.targetDevice);
    }


    /*
        초기 수신데이터 체크(필수)
        연결 후 초기에 수신받아서 정상연결인지를 확인해야하는 경우 사용합니다.
     */
    checkInitialData(data, config)
    {
        return this.checkAck(data, config); 
    }


    /*
        주기적으로 하드웨어에서 받은 데이터의 검증이 필요한 경우 사용합니다.
    */
    validateLocalData(data)
    {
        return true;
    }


    /*
        하드웨어에 전달할 데이터
        
        하드웨어 기기에 전달할 데이터를 반환합니다.
        slave 모드인 경우 duration 속성 간격으로 지속적으로 기기에 요청을 보냅니다.
    */
    requestLocalData()
    {
        return this.transferForDevice();
    }


    /*
        하드웨어에서 온 데이터 처리
    */
    handleLocalData(data)
    {
        this.receiverForDevice(data);
    }


    /*
        엔트리로 전달할 데이터
    */
    requestRemoteData(handler)
    {
        this.transferForEntry(handler);
    }


    /*
        엔트리에서 받은 데이터에 대한 처리
    */
    handleRemoteData(handler)
    {
        this.handlerForEntry(handler);
    }


    connect() {}


    disconnect(connect)
    {
        if (this.isConnect)
        {
            this.isConnect = false;
            connect.close();
        }
    }


    /*
        Web Socket 종료후 처리
    */
    reset()
    {
        this.log("reset", "");
        this.resetData();
    }


    /***************************************************************************************
     *  초기화
     ***************************************************************************************/

    resetData()
    {
        // -- JSON Objects ----------------------------------------------------------------
        // Device -> Entry 

        // Ack
        let ack                             = this.ack;
        ack._updated                        = 0;
        ack.ack_systemTime                  = 0;
        ack.ack_dataType                    = 0;
        ack.ack_crc16                       = 0;
        
        // Joystick
        let joystick                        = this.joystick; 
        joystick._updated                   = 0;
        joystick.joystick_left_x            = 0;
        joystick.joystick_left_y            = 0;
        joystick.joystick_left_direction    = 0;
        joystick.joystick_left_event        = 0;
        joystick.joystick_left_command      = 0;
        joystick.joystick_right_x           = 0;
        joystick.joystick_right_y           = 0;
        joystick.joystick_right_direction   = 0;
        joystick.joystick_right_event       = 0;
        joystick.joystick_right_command     = 0;

        // Button
        let button                          = this.button;
        button._updated                     = 0;
        button.button_button                = 0;
        button.button_event                 = 0;
    
        // State
        let state                           = this.state;
        state._updated                      = 0;
        state.state_modeVehicle             = 0;
        state.state_modeSystem              = 0;
        state.state_modeFlight              = 0;
        state.state_modeDrive               = 0;
        state.state_sensorOrientation       = 0;
        state.state_coordinate              = 0;
        state.state_battery                 = 0;
    
        // Attitude
        let attitude                        = this.attitude;
        attitude._updated                   = 0;
        attitude.attitude_roll              = 0;
        attitude.attitude_pitch             = 0;
        attitude.attitude_yaw               = 0;
    
        // IR Message
        let irmeessage                      = this.irmeessage;
        irmeessage._updated                 = 0;
        irmeessage.irmessage_irdata         = 0;
    
        // -- Control -----------------------------------------------------------------
        this.controlWheel                   = 0;        // 
        this.controlAccel                   = 0;        // 
        this.controlRoll                    = 0;        // 
        this.controlPitch                   = 0;        // 
        this.controlYaw                     = 0;        // 
        this.controlThrottle                = 0;        // 

        // -- Hardware ----------------------------------------------------------------
        this.bufferReceive                  = [];       // 데이터 수신 버퍼
        this.bufferTransfer                 = [];       // 데이터 송신 버퍼

        this.dataType                       = 0;        // 수신 받은 데이터의 타입
        this.dataLength                     = 0;        // 수신 받은 데이터의 길이
        this.from                           = 0;        // 송신 장치 타입
        this.to                             = 0;        // 수신 장치 타입
        this.indexSession                   = 0;        // 수신 받은 데이터의 세션
        this.indexReceiver                  = 0;        // 수신 받은 데이터의 세션 내 위치
        this.dataBlock                      = [];       // 수신 받은 데이터 블럭
        this.crc16Calculated                = 0;        // CRC16 계산 된 결과
        this.crc16Received                  = 0;        // CRC16 수신 받은 블럭

        this.maxTransferRepeat              = 3;        // 최대 반복 전송 횟수
        this.countTransferRepeat            = 0;        // 반복 전송 횟수
        this.dataTypeLastTransfered         = 0;        // 마지막으로 전송한 데이터의 타입

        this.timeReceive                    = 0;        // 데이터를 전송 받은 시각
        this.timeTransfer                   = 0;        // 예약 데이터를 전송한 시각
        this.timeTransferNext               = 0;        // 전송 가능한 다음 시간
        this.timeTransferInterval           = 24;       // 최소 전송 시간 간격

        this.countReqeustDevice             = 0;        // 장치에 데이터를 요청한 횟수 카운트 
    }

    

    /***************************************************************************************
     *  Communciation - 연결된 장치 확인
     ***************************************************************************************/

    // 수신 받은 Ack 처리
    checkAck(data, config)
    {
        this.receiverForDevice(data);

        if( this.targetDeviceID == undefined )
        {
            return false;
        }

        let ack = this.ack;
        if( ack._updated == true )
        {
            config.id = this.targetDeviceID;
            return true;
        }

        return false;
    }



    /***************************************************************************************
     *  Communciation - Entry.JS
     ***************************************************************************************/

    // Entry에서 받은 데이터 블럭 처리
    // Entry에서 수신 받은 데이터는 bufferTransfer에 바로 등록
    //
    // * entryjs에서 변수값을 entry-hw로 전송할 때 절차
    //   1. Entry.hw.setDigitalPortValue("", value) 명령을 사용하여 지정한 변수의 값을 등록
    //   2. Entry.hw.update() 를 사용하여 등록된 값 전체 전달
    //   3. delete Entry.hw.sendQueue[""] 를 사용하여 전달한 값을 삭제
    //   위와 같은 절차로 데이터를 전송해야 1회만 전송 됨.
    //   Entry.hw.update를 호출하면 등록된 값 전체를 한 번에 즉시 전송하는 것으로 보임
    handlerForEntry(handler)
    {
        if( this.bufferTransfer == undefined )
        {
            this.bufferTransfer = [];
        }

        // Buffer Clear
        if( handler.e(this.DataType.BUFFER_CLEAR) == true )
        {
            this.bufferTransfer = [];
        }


        // Light Manual
        if( (handler.e(this.DataType.LIGHT_MANUAL_FLAGS)        == true) &&
            (handler.e(this.DataType.LIGHT_MANUAL_BRIGHTNESS)   == true) )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target                  = handler.e(this.DataType.TARGET)                    ? handler.read(this.DataType.TARGET)                     : 0xFF;
            let lightManual_flags       = handler.e(this.DataType.LIGHT_MANUAL_FLAGS)        ? handler.read(this.DataType.LIGHT_MANUAL_FLAGS)         : 0;
            let lightManual_brightness  = handler.e(this.DataType.LIGHT_MANUAL_BRIGHTNESS)   ? handler.read(this.DataType.LIGHT_MANUAL_BRIGHTNESS)    : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 2;                     // 데이터의 길이
    
            // Header
            dataArray.push(0x20);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To
    
            // Data
            dataArray.push(lightManual_flags);
            dataArray.push(lightManual_brightness);

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);
            
            this.log("Transfer_To_Device / LightManual", dataArray);
        }

        // LightMode
        if( (handler.e(this.DataType.LIGHT_MODE_MODE)       == true) &&
            (handler.e(this.DataType.LIGHT_MODE_INTERVAL)   == true) )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target                  = handler.e(this.DataType.TARGET)                    ? handler.read(this.DataType.TARGET)                 : 0xFF;
            let lightMode_mode          = handler.e(this.DataType.LIGHT_MODE_MODE)           ? handler.read(this.DataType.LIGHT_MODE_MODE)        : 0;
            let lightMode_interval      = handler.e(this.DataType.LIGHT_MODE_INTERVAL)       ? handler.read(this.DataType.LIGHT_MODE_INTERVAL)    : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 2;                     // 데이터의 길이

            // Header
            dataArray.push(0x21);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To

            // Data
            dataArray.push(lightMode_mode);
            dataArray.push(lightMode_interval);

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);
            
            this.log("Transfer_To_Device / LightMode", dataArray);
        }
        

        // LightEvent
        if( (handler.e(this.DataType.LIGHT_EVENT_EVENT)     == true) &&
            (handler.e(this.DataType.LIGHT_EVENT_INTERVAL)  == true) &&
            (handler.e(this.DataType.LIGHT_EVENT_REPEAT)    == true) )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target              = handler.e(this.DataType.TARGET)                ? handler.read(this.DataType.TARGET)               : 0xFF;
            let lightEvent_event    = handler.e(this.DataType.LIGHT_EVENT_EVENT)     ? handler.read(this.DataType.LIGHT_EVENT_EVENT)    : 0;
            let lightEvent_interval = handler.e(this.DataType.LIGHT_EVENT_INTERVAL)  ? handler.read(this.DataType.LIGHT_EVENT_INTERVAL) : 0;
            let lightEvent_repeat   = handler.e(this.DataType.LIGHT_EVENT_REPEAT)    ? handler.read(this.DataType.LIGHT_EVENT_REPEAT)   : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 3;                     // 데이터의 길이
    
            // Header
            dataArray.push(0x2A);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To
    
            // Data Array
            dataArray.push(lightEvent_event);
            dataArray.push(lightEvent_interval);
            dataArray.push(lightEvent_repeat);

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);
            
            this.log("Transfer_To_Device / LightEvent", dataArray);
        }


        // Command
        if( handler.e(this.DataType.COMMAND_COMMAND) == true )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target          = handler.e(this.DataType.TARGET)           ? handler.read(this.DataType.TARGET)            : 0xFF;
            let command_command = handler.e(this.DataType.COMMAND_COMMAND)  ? handler.read(this.DataType.COMMAND_COMMAND)   : 0;
            let command_option  = handler.e(this.DataType.COMMAND_OPTION)   ? handler.read(this.DataType.COMMAND_OPTION)    : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 2;                     // 데이터의 길이

            // Header
            dataArray.push(0x11);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To

            // Data Array
            dataArray.push(command_command);
            dataArray.push(command_option);

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);

            switch( command_command )
            {
            case 0x24:  // CommandType::Stop
                {
                    // 정지 명령 시 조종 입력 값 초기화
                    this.controlRoll        = 0;
                    this.controlPitch       = 0;
                    this.controlYaw         = 0;
                    this.controlThrottle    = 0;
    
                    this.controlWheel       = 0;
                    this.controlAccel       = 0;
                }
                break;

            default:
                break;
            }

            this.log("Transfer_To_Device / Command" + command_command + ", option: " + command_option, dataArray);
        }


        // Control
        if( (handler.e(this.DataType.CONTROL_ROLL)      == true) ||
            (handler.e(this.DataType.CONTROL_PITCH)     == true) ||
            (handler.e(this.DataType.CONTROL_YAW)       == true) ||
            (handler.e(this.DataType.CONTROL_THROTTLE)  == true) )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target          = handler.e(this.DataType.TARGET)           ? handler.read(this.DataType.TARGET)            : 0x10;
            let controlRoll     = handler.e(this.DataType.CONTROL_ROLL)     ? handler.read(this.DataType.CONTROL_ROLL)      : this.controlRoll;
            let controlPitch    = handler.e(this.DataType.CONTROL_PITCH)    ? handler.read(this.DataType.CONTROL_PITCH)     : this.controlPitch;
            let controlYaw      = handler.e(this.DataType.CONTROL_YAW)      ? handler.read(this.DataType.CONTROL_YAW)       : this.controlYaw;
            let controlThrottle = handler.e(this.DataType.CONTROL_THROTTLE) ? handler.read(this.DataType.CONTROL_THROTTLE)  : this.controlThrottle;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 4;                     // 데이터의 길이

            this.controlRoll        = controlRoll;
            this.controlPitch       = controlPitch;
            this.controlYaw         = controlYaw;
            this.controlThrottle    = controlThrottle;

            // Header
            dataArray.push(0x10);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To

            // Data Array
            dataArray.push(controlRoll);
            dataArray.push(controlPitch);
            dataArray.push(controlYaw);
            dataArray.push(controlThrottle);
    
            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            //this.log("handlerForEntry() / Control / roll: " + controlRoll + ", pitch: " + controlPitch + ", yaw: " + controlYaw + ", throttle: " + controlThrottle, dataArray);

            this.bufferTransfer.push(dataArray);
            
            this.log("Transfer_To_Device / ControlQuad8", dataArray);
        }


        // Control
        if( (handler.e(this.DataType.CONTROL_WHEEL)   == true) ||
            (handler.e(this.DataType.CONTROL_ACCEL)   == true) )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target          = handler.e(this.DataType.TARGET)           ? handler.read(this.DataType.TARGET)            : 0x10;
            let controlWheel    = handler.e(this.DataType.CONTROL_WHEEL)    ? handler.read(this.DataType.CONTROL_WHEEL)     : this.controlWheel;
            let controlAccel    = handler.e(this.DataType.CONTROL_ACCEL)    ? handler.read(this.DataType.CONTROL_ACCEL)     : this.controlAccel;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 2;                     // 데이터의 길이
    
            this.controlWheel = controlWheel;
            this.controlAccel = controlAccel;

            // Header
            dataArray.push(0x10);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To

            // Data Array
            dataArray.push(controlWheel);
            dataArray.push(controlAccel);
    
            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            //this.log("handlerForEntry() / Control / roll: " + controlRoll + ", pitch: " + controlPitch + ", yaw: " + controlYaw + ", throttle: " + controlThrottle, dataArray);

            this.bufferTransfer.push(dataArray);
            
            this.log("Transfer_To_Device / ControlDouble8", dataArray);
        }


        // MotorSingle
        if( handler.e(this.DataType.MOTORSINGLE_TARGET) == true )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target                  = handler.e(this.DataType.TARGET)                   ? handler.read(this.DataType.TARGET)                : 0x10;
            let motorSingleTarget       = handler.e(this.DataType.MOTORSINGLE_TARGET)       ? handler.read(this.DataType.MOTORSINGLE_TARGET)    : 0;
            let motorSingleDirection    = handler.e(this.DataType.MOTORSINGLE_DIRECTION)    ? handler.read(this.DataType.MOTORSINGLE_DIRECTION) : 0;
            let motorSingleValue        = handler.e(this.DataType.MOTORSINGLE_VALUE)        ? handler.read(this.DataType.MOTORSINGLE_VALUE)     : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 4;                     // 데이터의 길이
    
            // Header
            dataArray.push(0x81);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To
    
            // Data Array
            dataArray.push(motorSingleTarget);
            dataArray.push(motorSingleDirection);
            dataArray.push(this.getByte0(motorSingleValue));
            dataArray.push(this.getByte1(motorSingleValue));

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);
            
            this.log("Transfer_To_Device / MotorSingle", dataArray);
        }


        // Buzzer
        if( handler.e(this.DataType.BUZZER_MODE) == true )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target          = handler.e(this.DataType.TARGET)       ? handler.read(this.DataType.TARGET)        : 0x11;
            let buzzer_mode     = handler.e(this.DataType.BUZZER_MODE)  ? handler.read(this.DataType.BUZZER_MODE)   : 0;
            let buzzer_value    = handler.e(this.DataType.BUZZER_VALUE) ? handler.read(this.DataType.BUZZER_VALUE)  : 0;
            let buzzer_time     = handler.e(this.DataType.BUZZER_TIME)  ? handler.read(this.DataType.BUZZER_TIME)   : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 5;                     // 데이터의 길이
    
            // Header
            dataArray.push(0x83);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To

            // Data
            dataArray.push(buzzer_mode);
            dataArray.push(this.getByte0(buzzer_value));
            dataArray.push(this.getByte1(buzzer_value));
            dataArray.push(this.getByte0(buzzer_time));
            dataArray.push(this.getByte1(buzzer_time));

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);

            this.log("Transfer_To_Device / Buzzer / buzzer_mode: " + buzzer_mode + ", buzzer_value: " + buzzer_value + ", buzzer_time: " + buzzer_time, dataArray);
        }


        // Vibrator
        if( handler.e(this.DataType.VIBRATOR_ON) == true )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target          = handler.e(this.DataType.TARGET)           ? handler.read(this.DataType.TARGET)            : 0x11;
            let vibrator_mode   = handler.e(this.DataType.VIBRATOR_MODE)    ? handler.read(this.DataType.VIBRATOR_MODE)     : 0;
            let vibrator_on     = handler.e(this.DataType.VIBRATOR_ON)      ? handler.read(this.DataType.VIBRATOR_ON)       : 0;
            let vibrator_off    = handler.e(this.DataType.VIBRATOR_OFF)     ? handler.read(this.DataType.VIBRATOR_OFF)      : 0;
            let vibrator_total  = handler.e(this.DataType.VIBRATOR_TOTAL)   ? handler.read(this.DataType.VIBRATOR_TOTAL)    : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 7;                     // 데이터의 길이
    
            // Header
            dataArray.push(0x84);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To

            // Data
            dataArray.push(vibrator_mode);
            dataArray.push(this.getByte0(vibrator_on));
            dataArray.push(this.getByte1(vibrator_on));
            dataArray.push(this.getByte0(vibrator_off));
            dataArray.push(this.getByte1(vibrator_off));
            dataArray.push(this.getByte0(vibrator_total));
            dataArray.push(this.getByte1(vibrator_total));

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);

            this.log("Transfer_To_Device / Vibrator", dataArray);
        }


        // IrMessage
        if( handler.e(this.DataType.IRMESSAGE_DATA) == true )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target          = handler.e(this.DataType.TARGET)           ? handler.read(this.DataType.TARGET)            : 0x10;
            let irmessage_data  = handler.e(this.DataType.IRMESSAGE_DATA)   ? handler.read(this.DataType.IRMESSAGE_DATA)    : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 4;                     // 데이터의 길이

            // Header
            dataArray.push(0x82);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To
    
            // Data
            dataArray.push(this.getByte0(irmessage_data));
            dataArray.push(this.getByte1(irmessage_data));
            dataArray.push(this.getByte2(irmessage_data));
            dataArray.push(this.getByte3(irmessage_data));

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);

            this.log("Transfer_To_Device / IrMessage", dataArray);
        }


        // UserInterface
        if( handler.e(this.DataType.USERINTERFACE_COMMAND) == true )
        {
            let dataArray = [];

            // Start Code
            this.addStartCode(dataArray);
            
            let target                  = handler.e(this.DataType.TARGET)                   ? handler.read(this.DataType.TARGET)                    : 0xFF;
            let userinterface_command   = handler.e(this.DataType.USERINTERFACE_COMMAND)    ? handler.read(this.DataType.USERINTERFACE_COMMAND)     : 0;
            let userinterface_function  = handler.e(this.DataType.USERINTERFACE_FUNCTION)   ? handler.read(this.DataType.USERINTERFACE_FUNCTION)    : 0;

            let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
            let dataLength = 2;                     // 데이터의 길이

            // Header
            dataArray.push(0x46);                   // Data Type
            dataArray.push(dataLength);             // Data Length
            dataArray.push(0x15);                   // From
            dataArray.push(target);                 // To
    
            // Data
            dataArray.push(userinterface_command);
            dataArray.push(userinterface_function);

            // CRC16
            this.addCRC16(dataArray, indexStart, dataLength);

            this.bufferTransfer.push(dataArray);

            this.log("Transfer_To_Device / User Interface / COMMAND: " + userinterface_command + ", FUNCTION: " + userinterface_function, dataArray);
        }

        //this.log("handlerForEntry()", dataArray);
    }


    // 시작 코드 추가
    addStartCode(dataArray)
    {
        if( dataArray == undefined )
        {
            dataArray = [];
        }

        // Start Code
        dataArray.push(0x0A);
        dataArray.push(0x55);
    }


    // CRC16을 계산해서 추가
    addCRC16(dataArray, indexStart, dataLength)
    {
        if( dataArray.length < indexStart + 4 + dataLength )
        {
            return;
        }
        
        // CRC16
        let crc16 = 0;
        let totalLength = 4 + dataLength;
        for(let i=0; i<totalLength; i++)
        {
            crc16 = this.calcCRC16(dataArray[indexStart + i], crc16);
        }
        dataArray.push((crc16 & 0xff));
        dataArray.push(((crc16 >> 8) & 0xff));
    }


    // Entry에 데이터 전송
    transferForEntry(handler)
    {
        // Joystick
        {
            let joystick = this.joystick;
            if( joystick._updated == true )
            {
                for(let key in joystick)
                {
                    handler.write(key, joystick[key]);
                }

                joystick._updated = false;
                //this.log("transferForEntry() / joystick", "");
            }
        }

        // Button
        {
            let button = this.button;
            if( button._updated == true )
            {
                for(let key in button)
                {
                    handler.write(key, button[key]);
                }

                button._updated = false;
            }
        }

        // State
        {
            let state = this.state;
            if( state._updated == true )
            {
                for(let key in state)
                {
                    handler.write(key, state[key]);
                }

                state._updated = false;
            }
        }

        // Attitude
        {
            let attitude = this.attitude;
            if( attitude._updated == true )
            {
                for(let key in attitude)
                {
                    handler.write(key, attitude[key]);
                }
    
                attitude._updated == false;
            }
        }
    
        // IR Message
        {
            let irmeessage = this.irmeessage;
            if( irmeessage._updated == true )
            {
                for(let key in irmeessage)
                {
                    handler.write(key, irmeessage[key]);
                }
    
                irmeessage._updated == false;
            }
        }

        // Entry-hw information
        {
            if( this.bufferTransfer == undefined )
            {
                this.bufferTransfer = [];
            }

            handler.write("entryhw_countTransferReserved", this.bufferTransfer.length);
        }
    }


    /***************************************************************************************
     *  Communciation
     ***************************************************************************************/

    // 장치로부터 받은 데이터 배열 처리
    receiverForDevice(data)
    {
        if( this.receiveBuffer == undefined )
        {
            this.receiveBuffer = [];
        }

        // 수신 받은 데이터를 버퍼에 추가
        for(let i=0; i<data.length; i++)
        {
            this.receiveBuffer.push(data[i]);
        }

        //this.log("receiverForDevice()", this.receiveBuffer);

        // 버퍼로부터 데이터를 읽어 하나의 완성된 데이터 블럭으로 변환
        while(this.receiveBuffer.length > 0)
        {
            let data            = this.receiveBuffer.shift();
            let flagContinue    = true;
            let flagSessionNext = false;
            let flagComplete    = false;
            
            switch(this.indexSession)
            {
            case 0:
                // Start Code
                {               
                    switch( this.indexReceiver )
                    {
                    case 0:
                        if( data != 0x0A )
                        {
                            continue;
                        }
                        break;
                    
                    case 1:
                        if( data != 0x55 )
                        {
                            flagContinue = false;
                        }
                        else
                        {
                            flagSessionNext = true;
                        }
                        break;
                    }
                }
                break;

            case 1:
                // Header
                {
                    switch( this.indexReceiver )
                    {
                    case 0:
                        {
                            this.dataType = data;
                            this.crc16Calculated = this.calcCRC16(data, 0);
                        }
                        break;
                    
                    case 1:
                        {
                            this.dataLength = data;
                            this.crc16Calculated = this.calcCRC16(data, this.crc16Calculated);
                        }
                        break;
                    
                    case 2:
                        {
                            this.from = data;
                            this.crc16Calculated = this.calcCRC16(data, this.crc16Calculated);
                        }
                        break;
                    
                    case 3:
                        {
                            this.to = data;
                            this.crc16Calculated = this.calcCRC16(data, this.crc16Calculated);
                            this.dataBlock = [];        // 수신 받은 데이터 블럭
                            if( this.dataLength == 0 )
                            {
                                this.indexSession++;    // 데이터의 길이가 0인 경우 바로 CRC16으로 넘어가게 함
                            }
                            flagSessionNext = true;
                        }
                        break;
                    }
                }
                break;

            case 2:
                // Data
                {
                    this.dataBlock.push(data);
                    this.crc16Calculated = this.calcCRC16(data, this.crc16Calculated);
                    
                    if( this.dataBlock.length == this.dataLength )
                    {
                        flagSessionNext = true;
                    }
                }
                break;

            case 3:
                // CRC16
                {
                    switch( this.indexReceiver )
                    {
                    case 0:
                        {
                            this.crc16Received = data;
                        }
                        break;
                    
                    case 1:
                        {
                            this.crc16Received = this.crc16Received + (data << 8);
                            flagComplete = true;
                        }
                        break;
                    }
                }
                break;

            default:
                {
                    flagContinue = false;
                }
                break;
            }

            // 데이터 전송 완료 처리
            if( flagComplete == true )
            {
                if( this.crc16Calculated == this.crc16Received )
                {
                    this.handlerForDevice();
                }

                flagContinue = false;
            }

            // 데이터 처리 결과에 따라 인덱스 변수 처리
            if( flagContinue == true )
            {
                if( flagSessionNext == true )
                {
                    this.indexSession++;
                    this.indexReceiver = 0;             
                }
                else
                {
                    this.indexReceiver++;
                }
            }
            else
            {
                this.indexSession       = 0;        // 수신 받는 데이터의 세션
                this.indexReceiver      = 0;        // 수신 받는 데이터의 세션 내 위치
            }
        }
    }


    // 장치로부터 받은 데이터 블럭 처리
    handlerForDevice()
    {
        // skip 할 대상만 case로 등록
        switch( this.dataType )
        {
        case 2:     break;
        case 64:    break;
        case 65:    break;
        case 0x71:  break;

        default:
            {
                this.log("Receive_From_Device / From: " + this.from + " / To: " + this.to + " / Type: " + this.dataType + " / ", this.dataBlock);
            }
            break;
        }

        this.timeReceive = (new Date()).getTime();

        // 상대측에 정상적으로 데이터를 전달했는지 확인
        switch( this.dataType )
        {
        case 0x02:  // Ack
            if( this.dataBlock.length == 7 )
            {
                // Device -> Entry 
                let ack             = this.ack;
                ack._updated        = true;
                ack.ack_systemTime  = this.extractUInt32(this.dataBlock, 0);
                ack.ack_dataType    = this.extractUInt8(this.dataBlock, 4);
                ack.ack_crc16       = this.extractUInt16(this.dataBlock, 5);

                // ping에 대한 ack는 로그 출력하지 않음
                if( ack.ack_dataType != 0x01 )
                {
                    console.log("Receive_From_Device - Ack / From: " + this.from + " / SystemTime: " + ack.ack_systemTime + " / DataType: " + ack.ack_dataType + " / Repeat: " + this.countTransferRepeat + " / Crc16Transfer: " + this.crc16Transfered + " / Crc16Get: " + ack.ack_crc16);
                }

                // 마지막으로 전송한 데이터에 대한 응답을 받았다면 
                if( this.bufferTransfer != undefined &&
                    this.bufferTransfer.length > 0 &&
                    this.dataTypeLastTransfered == ack.ack_dataType &&
                    this.crc16Transfered == ack.ack_crc16 )
                {
                    this.bufferTransfer.shift();
                    this.countTransferRepeat = 0;
                }
            }
            break;

        default:
            {
                // 마지막으로 요청한 데이터를 받았다면 
                if( this.bufferTransfer != undefined &&
                    this.bufferTransfer.length > 0 &&
                    this.dataTypeLastTransfered == this.dataType )
                {
                    this.bufferTransfer.shift();
                    this.countTransferRepeat = 0;
                    
                    console.log("Receive_From_Device - Response / From: " + this.from + " / DataType: " + this.dataType);
                }
            }
            break;
        }
    
    
        switch( this.dataType )
        {
        case 0x40:  // State
            if( this.dataBlock.length == 7 )
            {
                // Device -> Entry 
                let state                        = this.state;
                state._updated                   = true;
                state.state_modeVehicle          = this.extractUInt8(this.dataBlock, 0);
                state.state_modeSystem           = this.extractUInt8(this.dataBlock, 1);
                state.state_modeFlight           = this.extractUInt8(this.dataBlock, 2);
                state.state_modeDrive            = this.extractUInt8(this.dataBlock, 3);
                state.state_sensorOrientation    = this.extractUInt8(this.dataBlock, 4);
                state.state_coordinate           = this.extractUInt8(this.dataBlock, 5);
                state.state_battery              = this.extractUInt8(this.dataBlock, 6);
                
                // 비행 모드로 들어갔는데 설정이 비행 모드가 아닌경우 비행 모드로 변경
                // 자동차 모드로 들어갔는데 설정이 자동차 모드가 아닌 경우 자동차 모드로 변경
                if( this.targetModeVehicle != undefined )
                {
                    switch( this.targetModeVehicle )
                    {
                    case 0x10:
                        {
                            if( state.state_modeVehicle != 0x10 &&
                                state.state_modeVehicle != 0x11 &&
                                state.state_modeVehicle != 0x12 )
                            {
                                this.reserveModeVehicle(0x10);
                            }
                        }
                        break;

                    case 0x20:
                        {
                            if( state.state_modeVehicle != 0x20 &&
                                state.state_modeVehicle != 0x21 )
                            {
                                this.reserveModeVehicle(0x20);
                            }
                        }
                        break;

                    default:
                        break;
                    }
                }
            }
            break;
        
    case 0x41:  // Attitude
        if( this.dataBlock.length == 6 )
        {
            // Device -> Entry 
            let attitude            = this.attitude;
            attitude._updated       = true;
            attitude.attitude_roll  = this.extractInt16(this.dataBlock, 0);
            attitude.attitude_pitch = this.extractInt16(this.dataBlock, 2);
            attitude.attitude_yaw   = this.extractInt16(this.dataBlock, 4);

            //console.log("handlerForDevice - attitude: " + attitude.attitude_roll + ", " + attitude.attitude_pitch + ", " + attitude.attitude_yaw);
        }
        break;

        
        case 0x70:  // Button
            if( this.dataBlock.length == 3 )
            {
                // Device -> Entry 
                let button              = this.button;
                button._updated         = true;
                button.button_button    = this.extractUInt16(this.dataBlock, 0);
                button.button_event     = this.extractUInt8(this.dataBlock, 2);
    
                //console.log("Receive_From_Device - Button: " + button.button_button + ", " + button.button_event);
            }
            break;
    
        case 0x71:  // Joystick
            if( this.dataBlock.length == 10 )
            {
                // Device -> Entry 
                let joystick                        = this.joystick;
                joystick._updated                   = true;
                joystick.joystick_left_x            = this.extractInt8(this.dataBlock,  0);
                joystick.joystick_left_y            = this.extractInt8(this.dataBlock,  1);
                joystick.joystick_left_direction    = this.extractUInt8(this.dataBlock, 2);
                joystick.joystick_left_event        = this.extractUInt8(this.dataBlock, 3);
                joystick.joystick_left_command      = this.extractUInt8(this.dataBlock, 4);
                joystick.joystick_right_x           = this.extractInt8(this.dataBlock,  5);
                joystick.joystick_right_y           = this.extractInt8(this.dataBlock,  6);
                joystick.joystick_right_direction   = this.extractUInt8(this.dataBlock, 7);
                joystick.joystick_right_event       = this.extractUInt8(this.dataBlock, 8);
                joystick.joystick_right_command     = this.extractUInt8(this.dataBlock, 9);
    
                //console.log("Receive_From_Device - Joystick: " + joystick.joystick_left_x + ", " + joystick.joystick_left_y + ", " + joystick.joystick_right_x + ", " + joystick.joystick_right_y);
            }
            break;
        
        case 0x82:  // IR Message
            if( this.dataBlock.length == 4 )
            {
                // Device -> Entry 
                let irmeessage              = this.irmeessage;
                irmeessage._updated         = true;
                irmeessage.irmessage_irdata = this.extractUInt32(this.dataBlock, 0);
    
                //console.log("Receive_From_Device - IR Message: " + irmeessage.irmessage_irdata);
            }
            break;
    
        default:
            break;
        }
    }

    // 자바스크립트에서 바이너리 핸들링
    // http://mohwa.github.io/blog/javascript/2015/08/31/binary-inJS/
    extractInt8(dataArray, startIndex)
    {
        let value = this.extractUInt8(dataArray, startIndex);
        if( (value & 0x80) != 0)
        {
            value = -(0x100 - value);
        }
        return value;
    }

    extractUInt8(dataArray, startIndex)
    {
        if( dataArray.length >= startIndex + 1 )
        {
            let value = dataArray[startIndex];
            return value;
        }
        else
        {
            return 0;
        }
    }

    extractInt16(dataArray, startIndex)
    {
        let value = this.extractUInt16(dataArray, startIndex);
        if( (value & 0x8000) != 0)
        {
            value = -(0x10000 - value);
        }
        return value;
    }

    extractUInt16(dataArray, startIndex)
    {
        if( dataArray.length >= startIndex + 2 )
        {
            let value = ((dataArray[startIndex + 1]) << 8) + dataArray[startIndex];
            return value;
        }
        else
        {
            return 0;
        }
    }

    extractInt32(dataArray, startIndex)
    {
        let value = this.extractUInt32(dataArray, startIndex);
        if( (value & 0x80000000) != 0)
        {
            value = -(0x100000000 - value);
        }
        return value;
    }

    extractUInt32(dataArray, startIndex)
    {
        if( dataArray.length >= startIndex + 4 )
        {
            let value = ((dataArray[startIndex + 3]) << 24) + ((dataArray[startIndex + 2]) << 16) + ((dataArray[startIndex + 1]) << 8) + dataArray[startIndex];
            return value;
        }
        else
        {
            return 0;
        }
    }

    extractFloat32(dataArray, startIndex)
    {
        if (dataArray.length >= startIndex + 4)
        {
            let buffer = new ArrayBuffer(4);
            let float32View = new Float32Array(buffer, 0, 1);
            let uint8View = new Uint8Array(buffer, 0, 4)
            uint8View[0] = dataArray[startIndex];
            uint8View[1] = dataArray[startIndex + 1];
            uint8View[2] = dataArray[startIndex + 2];
            uint8View[3] = dataArray[startIndex + 3];
    
            return float32View[0].toFixed(2);
        }
        else
        {
            return 0;
        }
    }

    // 값 추출
    getByte0(b)
    {
        return (b & 0xff);
    }

    getByte1(b)
    {
        return ((b >> 8) & 0xff);
    }

    getByte2(b)
    {
        return ((b >> 16) & 0xff);
    }

    getByte3(b)
    {
        return ((b >> 24) & 0xff);
    }

    // 장치에 데이터 전송
    transferForDevice()
    {
        let now = (new Date()).getTime();

        if( now < this.timeTransferNext )
        {
            return null;
        }
        
        this.timeTransferNext = now + this.timeTransferInterval;

        if( this.bufferTransfer == undefined )
        {
            this.bufferTransfer = [];
        }

        this.countReqeustDevice++;

        if( this.bufferTransfer.length == 0 )
        {
            switch( this.targetDevice )
            {
            case 0x10:
                {
                    // 예약된 요청이 없는 경우 데이터 요청 등록
                    switch( this.countReqeustDevice % 6 )
                    {
                    case 0:     return this.ping(0x10);                     // 드론
                    case 2:     return this.ping(0x11);                     // 조종기
                    case 4:     return this.reserveRequest(0x10, 0x40);     // 드론
                    default:    return this.reserveRequest(0x10, 0x41);     // 드론
                    }
                }
                break;

            default:
                {
                    // 예약된 요청이 없는 경우 데이터 요청
                    return this.ping(this.targetDevice);
                }
                break;
            }
        }
        else
        {
            switch( this.targetDevice )
            {
            case 0x10:
                {
                    // 예약된 요청이 있는 경우 데이터 요청 등록
                    switch( this.countReqeustDevice % 15 )
                    {
                    case 3:     return this.ping(0x10);                     // 드론
                    case 6:     return this.ping(0x11);                     // 조종기
                    case 9:     return this.reserveRequest(0x10, 0x40);     // 드론
                    case 12:    return this.reserveRequest(0x10, 0x41);     // 드론
                    default:    break;
                    }
                }
                break;

            default:
                {
                    // 예약된 요청이 있는 경우
                    switch( this.countReqeustDevice % 10 )
                    {
                    case 0:     return this.ping(this.targetDevice);
                    default:    break;
                    }
                }
                break;
            }
        }
    
        // 예약된 데이터 전송 처리
        let arrayTransfer = this.bufferTransfer[0];             // 전송할 데이터 배열(첫 번째 데이터 블럭 전송)
        if( arrayTransfer[2] == 0x04 )
        {
            this.dataTypeLastTransfered = arrayTransfer[6];     // 요청한 데이터의 타입(Request인 경우)
        }
        else
        {
            this.dataTypeLastTransfered = arrayTransfer[2];     // 전송한 데이터의 타입(이외의 모든 경우)
        }
        this.countTransferRepeat++;
        this.timeTransfer = (new Date()).getTime();
    
        this.crc16Transfered = (arrayTransfer[arrayTransfer.length - 1] << 8) | (arrayTransfer[arrayTransfer.length - 2]);
    
        //this.log("Data Transfer - Repeat(" + this.bufferTransfer.length + ") : " + this.countTransferRepeat, this.bufferTransfer[0]);
        //console.log("Data Transfer - Repeat: " + this.countTransferRepeat, this.bufferTransfer[0]);
    
        // maxTransferRepeat 이상 전송했음에도 응답이 없는 경우엔 다음으로 넘어감
        if( this.countTransferRepeat >= this.maxTransferRepeat)
        {
            this.bufferTransfer.shift();
            this.countTransferRepeat = 0;
        }
    
        //this.log("Module.prototype.transferForDevice()", arrayTransfer);
    
        return arrayTransfer;
    }

    // Ping
    ping(target)
    {
        let dataArray = [];

        // Start Code
        this.addStartCode(dataArray);
        
        let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
        let dataLength = 4;                     // 데이터의 길이
    
        // Header
        dataArray.push(0x01);           // Data Type (UpdateLookupTarget)
        dataArray.push(dataLength);     // Data Length
        dataArray.push(0x15);           // From
        dataArray.push(target);         // To
    
        // Data Array
        dataArray.push(0x00);           // systemTime
        dataArray.push(0x00);
        dataArray.push(0x00);
        dataArray.push(0x00);

        // CRC16
        this.addCRC16(dataArray, indexStart, dataLength);

        //this.log("ping()", dataArray);
        
        return dataArray;
    }

    // 데이터 요청
    reserveRequest(target, dataType)
    {
        let dataArray = [];

        // Start Code
        this.addStartCode(dataArray);
        
        let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
        let dataLength = 1;                     // 데이터의 길이

        // Header
        dataArray.push(0x04);           // Data Type (Request)
        dataArray.push(dataLength);     // Data Length
        dataArray.push(0x15);           // From
        dataArray.push(target);         // To

        // Data Array
        dataArray.push(dataType);       // Request DataType

        // CRC16
        this.addCRC16(dataArray, indexStart, dataLength);

        //this.log("reserveRequest()", dataArray);
        
        return dataArray;
    }

    // 모드 변경
    reserveModeVehicle(modeVehicle)
    {
        let dataArray = [];

        // Start Code
        this.addStartCode(dataArray);
        
        let indexStart = dataArray.length;      // 배열에서 데이터를 저장하기 시작하는 위치
        let dataLength = 2;     // 데이터의 길이
    
        // Header
        dataArray.push(0x11);           // Data Type
        dataArray.push(dataLength);     // Data Length
        dataArray.push(0x15);           // From
        dataArray.push(0x10);           // To
    
        // Data Array
        dataArray.push(0x10);           // CommandType
        dataArray.push(modeVehicle);    // Option

        // CRC16
        this.addCRC16(dataArray, indexStart, dataLength);

        //this.log("reserveRequest()", dataArray);
        
        return dataArray;
    }


    // 입력받은 문자열 처리
    // https://stackoverflow.com/questions/6226189/how-to-convert-a-string-to-bytearray
    stringToAsciiByteArray(str)
    {
        let bytes = [];
        for(let i=0; i<str.length; i++)
        {
            let charCode = str.charCodeAt(i);
            if( charCode > 0xFF )  // char > 1 byte since charCodeAt returns the UTF-16 value
            {
                // throw new Error('Character ' + String.fromCharCode(charCode) + ' can\'t be represented by a US-ASCII byte.');
                continue;
            }
            bytes.push(charCode);
        }
        return bytes;
    }



    /***************************************************************************************
     *  CRC16
     ***************************************************************************************/

    /*
    * Copyright 2001-2010 Georges Menie (www.menie.org)
    * All rights reserved.
    * Redistribution and use in source and binary forms, with or without
    * modification, are permitted provided that the following conditions are met:
    *
    *     * Redistributions of source code must retain the above copyright
    *       notice, this list of conditions and the following disclaimer.
    *     * Redistributions in binary form must reproduce the above copyright
    *       notice, this list of conditions and the following disclaimer in the
    *       documentation and/or other materials provided with the distribution.
    *     * Neither the name of the University of California, Berkeley nor the
    *       names of its contributors may be used to endorse or promote products
    *       derived from this software without specific prior written permission.
    *
    * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND ANY
    * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    * DISCLAIMED. IN NO EVENT SHALL THE REGENTS AND CONTRIBUTORS BE LIABLE FOR ANY
    * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
    calcCRC16(data, crc)
    {
        if( data > 255 )
        {
            throw new RangeError();
        }

        let index   = ((crc>>8) ^ data) & 0x00FF;
        let crcNext = ((crc<<8) & 0xFFFF) ^ this.crc16table[index];

        return crcNext;
    }


    /***************************************************************************************
     *  로그 출력
     ***************************************************************************************/
    log(message, data = 'undefined')
    {
        // 로그를 출력하지 않으려면 아래 주석을 활성화 할 것
        //*
        let strInfo = "";

        switch( typeof data )
        {
        case "object":
            {
                strInfo = " / [ " + this.convertByteArrayToHexString(data) + " ]";
                console.log(message + " / " + (typeof data) + strInfo);
            }
            break;

        default:
            {
                console.log(message);
            }
            break;
        }

        // */
    }


    // 바이트 배열을 16진수 문자열로 변경 
    convertByteArrayToHexString(data)
    {
        let strHexArray = "";
        let strHex;

        if( typeof data == "object" && data.length > 1 )
        {
            for(let i=0; i<data.length; i++)
            {
                strHex = data[i].toString(16).toUpperCase();
                strHexArray += " ";
                if( strHex.length == 1 )
                {
                    strHexArray += "0";
                }
                strHexArray += strHex;
            }
            strHexArray = strHexArray.substr(1, strHexArray.length - 1);
        }
        else
        {
            strHexArray = data.toString();
        }
        
        return strHexArray;
    }
}

module.exports = byrobot_dronefighter_base;

